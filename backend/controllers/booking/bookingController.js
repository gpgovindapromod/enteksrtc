/**
 * Booking Controller
 * ------------------
 * Lifecycle:
 *   POST /bookings/checkout
 *     → Validates request, checks seat availability, calculates fare server-side,
 *       creates Booking with status=PENDING + temporary hold, creates a
 *       server-side payment order. Returns orderId + bookingId to frontend.
 *       For RAZORPAY gateway, also returns the PUBLIC key_id (never the secret).
 *
 *   POST /bookings/verify-payment
 *     → Frontend returns orderId + paymentId + signature.
 *       Backend verifies signature with payment provider using HMAC-SHA256.
 *       On success: bookingStatus=CONFIRMED, paymentStatus=PAID.
 *       On failure: paymentStatus=FAILED, hold stays until it expires naturally.
 *
 *   POST /bookings/webhook  (payment provider → backend, not frontend)
 *     → Verifies webhook signature using raw body. Idempotently confirms booking.
 *       Also handles payment.failed events to mark booking FAILED.
 *
 *   GET  /bookings/my-bookings
 *   GET  /bookings/:bookingId
 *   POST /bookings/:bookingId/cancel
 *
 * Security:
 *   - All booking endpoints require JWT authentication (except /webhook).
 *   - Server calculates amount; client-supplied amounts are IGNORED.
 *   - Payment is verified server-side via HMAC signature, never via frontend flag.
 *   - IDOR: every lookup filters by passengerId === req.user.id.
 *   - Idempotency: re-verifying an already-PAID booking returns success
 *     without creating duplicate records.
 *   - Duplicate transaction ID protection: Payment.transactionId has unique index.
 *   - Concurrent bookings: pessimistic lock on Trip document inside transaction.
 *   - Expired holds: PENDING bookings past holdExpiresAt are excluded from the
 *     overlap check, so their seats are freed automatically.
 *   - RAZORPAY_KEY_SECRET is NEVER sent to the frontend.
 *   - State machine: invalid transitions (PAID→PENDING, CANCELLED→PAID) rejected.
 */

import Booking from '../../database/models/Booking.js';
import BookingSeat from '../../database/models/BookingSeat.js';
import Trip from '../../database/models/Trip.js';
import RouteStop from '../../database/models/RouteStop.js';
import Payment from '../../database/models/Payment.js';
import Ticket from '../../database/models/Ticket.js';
import { calculateFare, getFareConfig } from '../../utils/fareUtils.js';
import { auditBooking } from '../../utils/auditUtils.js';
import { evaluateCancellation } from '../../utils/cancellationPolicy.js';
import { notificationService } from '../../services/notificationService.js';
import {
  createPaymentOrder,
  verifyPayment,
  verifyWebhookSignature,
  activeGateway,
  getPublicKeyId,
  createRefund,
} from '../../services/paymentService.js';
import mongoose from 'mongoose';
import crypto from 'crypto';

// How long a seat hold lasts before it expires (15 minutes)
const HOLD_DURATION_MS = 15 * 60 * 1000;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Returns the current Date used as cutoff for hold expiry checks.
 */
const activeHoldCutoff = () => new Date();

/**
 * Payment state machine: validates allowed transitions.
 * Returns true if the transition is allowed, false if invalid.
 */
const isValidPaymentTransition = (from, to) => {
  const allowed = {
    PENDING:  ['PAID', 'FAILED'],
    PAID:     ['REFUNDED'],
    FAILED:   [],             // terminal — no transitions from FAILED
    REFUNDED: [],             // terminal — no transitions from REFUNDED
  };
  return (allowed[from] || []).includes(to);
};

// ─── CHECKOUT (creates hold + payment order) ──────────────────────────────────

export const checkout = async (req, res) => {
  try {
    const { tripId, boardingStopId, droppingStopId, seats } = req.body;
    const userId = req.user.id || req.user._id;

    // ── Basic field validation ─────────────────────────────────────────────
    if (!tripId || !boardingStopId || !droppingStopId || !seats || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required booking details' });
    }

    // ── Passenger validation (before acquiring the lock) ──────────────────
    if (seats.length === 1 && seats[0].age < 12) {
      return res.status(400).json({ success: false, message: 'A passenger under 12 years cannot book a single ticket.' });
    }
    for (const seat of seats) {
      if (!seat.passengerName || seat.passengerName.trim() === '') {
        return res.status(400).json({ success: false, message: `Passenger name is required for seat ${seat.seatNo}` });
      }
      if (!seat.age || isNaN(seat.age) || seat.age < 1 || seat.age > 120) {
        return res.status(400).json({ success: false, message: `Invalid age for seat ${seat.seatNo}` });
      }
      if (!seat.gender || !['Male', 'Female', 'Other'].includes(seat.gender)) {
        return res.status(400).json({ success: false, message: `Invalid gender for seat ${seat.seatNo}` });
      }
    }

    // ── Transaction: lock trip, check availability, create hold ──────────
    const session = await mongoose.startSession();
    session.startTransaction();

    let newBooking;
    try {
      // Pessimistic lock on the trip document
      const trip = await Trip.findOneAndUpdate(
        { _id: tripId },
        { $set: { lastBookingAttempt: new Date() } },
        { new: true, session }
      ).populate('busId');
      if (!trip) throw new Error('Trip not found');
      
      // ── Trip Lifecycle & Cutoff Validation ────────────────────────────────
      if (trip.status !== 'SCHEDULED') {
        throw new Error(`Trip is currently ${trip.status} and not open for booking`);
      }
      
      const cutoffMinutes = trip.bookingCutoffMinutes || 30;
      const cutoffTime = new Date(new Date(trip.departureDate).getTime() - (cutoffMinutes * 60000));
      if (new Date() > cutoffTime) {
        throw new Error(`Booking cutoff passed. Bookings closed ${cutoffMinutes} minutes before departure.`);
      }
      // ──────────────────────────────────────────────────────────────────────

      const boardingRouteStop = await RouteStop.findOne({ routeId: trip.routeId, stopId: boardingStopId });
      const droppingRouteStop = await RouteStop.findOne({ routeId: trip.routeId, stopId: droppingStopId });

      if (!boardingRouteStop || !droppingRouteStop || boardingRouteStop.sequence >= droppingRouteStop.sequence) {
        throw new Error('Invalid boarding or dropping stops');
      }

      const boardingSequence = boardingRouteStop.sequence;
      const droppingSequence = droppingRouteStop.sequence;

      // Overlap check: exclude expired holds so abandoned checkouts free seats
      const now = activeHoldCutoff();
      const overlappingBookings = await Booking.find({
        tripId,
        bookingStatus: { $ne: 'CANCELLED' },
        paymentStatus: { $nin: ['FAILED'] },
        boardingSequence: { $lt: droppingSequence },
        droppingSequence: { $gt: boardingSequence },
        $or: [
          { holdExpiresAt: { $gt: now } },  // active holds
          { bookingStatus: 'CONFIRMED' },    // confirmed bookings (no hold needed)
        ],
      }).select('_id').session(session);

      if (overlappingBookings.length > 0) {
        const bookingIds = overlappingBookings.map((b) => b._id);
        const requestedSeatNos = seats.map((s) => s.seatNo);
        const alreadyBooked = await BookingSeat.findOne({
          bookingId: { $in: bookingIds },
          seatNo: { $in: requestedSeatNos },
        }).session(session);
        if (alreadyBooked) {
          throw new Error(`Seat ${alreadyBooked.seatNo} is already booked for this segment`);
        }
      }

      // ── Server-side fare calculation (frontend amount ignored) ────────
      const distanceKm =
        (droppingRouteStop.distanceFromSource || 0) - (boardingRouteStop.distanceFromSource || 0);
      const serviceCategory = trip.busId?.category || 'Ordinary';
      const perSeatFare = calculateFare(distanceKm, serviceCategory);
      const totalFare = perSeatFare * seats.length;
      const config = getFareConfig(serviceCategory);
      const calculatedFarePaise = distanceKm * config.ratePaise;
      const finalFarePaise = Math.max(calculatedFarePaise, config.minFarePaise) * seats.length;

      // ── Create PENDING booking with hold ──────────────────────────────
      const bookingNumber = 'KSRTC' + crypto.randomBytes(4).toString('hex').toUpperCase();
      const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MS);

      newBooking = new Booking({
        bookingNumber,
        passengerId: userId,
        tripId,
        boardingStop: boardingStopId,
        droppingStop: droppingStopId,
        boardingSequence,
        droppingSequence,
        distanceKm,
        farePaise: finalFarePaise,
        bookedBy: userId,
        totalFare,
        bookingStatus: 'PENDING',
        paymentStatus: 'PENDING',
        paymentGateway: activeGateway,
        holdExpiresAt,
      });
      await newBooking.save({ session });
      await auditBooking({
        bookingId: newBooking._id,
        bookingNumber: newBooking.bookingNumber,
        userId: newBooking.passengerId,
        eventType: 'BOOKING_CREATED',
        previousBookingStatus: null,
        newBookingStatus: 'PENDING',
        previousPaymentStatus: null,
        newPaymentStatus: 'PENDING',
        source: 'USER',
        reason: 'Initial booking hold',
        session
      });

      // Create BookingSeats (linked to hold booking)
      const bookingSeats = seats.map((seat) => ({
        bookingId: newBooking._id,
        seatNo: seat.seatNo,
        passengerName: seat.passengerName,
        age: seat.age,
        gender: seat.gender,
      }));
      await BookingSeat.insertMany(bookingSeats, { session });

      await session.commitTransaction();
      session.endSession();
    } catch (txError) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: txError.message });
    }

    // ── Create payment order OUTSIDE transaction (provider network call) ──
    let paymentOrder;
    try {
      paymentOrder = await createPaymentOrder({
        amountPaise: newBooking.farePaise,
        bookingId: newBooking._id,
        receipt: newBooking.bookingNumber,
      });
    } catch (providerError) {
      // If provider fails, mark booking as FAILED (seat hold will expire naturally)
      await Booking.findByIdAndUpdate(newBooking._id, { paymentStatus: 'FAILED' });
      console.error('[Checkout] Payment provider error:', providerError.message, { bookingId: newBooking._id });
      return res.status(502).json({ success: false, message: 'Payment provider unavailable. Please try again.' });
    }

    // Store the orderId from the provider in our booking record
    await Booking.findByIdAndUpdate(newBooking._id, { paymentOrderId: paymentOrder.orderId });

    console.info('[Checkout] Seat hold created', {
      bookingId: newBooking._id,
      bookingNumber: newBooking.bookingNumber,
      orderId: paymentOrder.orderId,
      farePaise: newBooking.farePaise,
      gateway: paymentOrder.gateway,
    });

    return res.status(201).json({
      success: true,
      message: 'Seat held. Complete payment within 15 minutes.',
      bookingId: newBooking._id,
      bookingNumber: newBooking.bookingNumber,
      holdExpiresAt: newBooking.holdExpiresAt,
      payment: {
        orderId: paymentOrder.orderId,
        amount: paymentOrder.amount,         // paise (backend-authoritative)
        amountRs: newBooking.totalFare,      // rupees (display only)
        currency: paymentOrder.currency,
        gateway: paymentOrder.gateway,
        // Public key ID returned ONLY for Razorpay to init the Checkout widget.
        // RAZORPAY_KEY_SECRET is NEVER included here.
        keyId: getPublicKeyId(),
      },
    });
  } catch (error) {
    console.error('[Checkout] Unexpected error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ─── ATOMIC BOOKING CONFIRMATION LOGIC ────────────────────────────────────────

const confirmBookingPayment = async ({ bookingId, transactionId, gateway }) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // 1. Locate booking and lock it
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw new Error('Booking not found');

    // 2. Check if already confirmed (idempotency)
    if (booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID') {
      await session.commitTransaction();
      return { success: true, alreadyConfirmed: true, booking };
    }

    // 3. Reject invalid states
    if (booking.bookingStatus === 'CANCELLED') {
      throw new Error('Booking has been cancelled and cannot be confirmed');
    }

    // 4. Check hold validity
    if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
      // Hold expired but payment succeeded! We must NOT confirm.
      // We will record the payment but trigger refund.
      booking.paymentStatus = 'REFUND_REQUESTED';
      booking.bookingStatus = 'CANCELLED';
      booking.holdExpiresAt = null;
      await booking.save({ session });
      
      await auditBooking({
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        userId: booking.passengerId,
        eventType: 'HOLD_EXPIRED',
        previousBookingStatus: 'PENDING',
        newBookingStatus: 'CANCELLED',
        previousPaymentStatus: 'PENDING',
        newPaymentStatus: 'REFUND_REQUESTED',
        source: 'SYSTEM',
        reason: 'Hold expired before payment capture',
        session
      });

      // Ensure payment is recorded so we can refund it
      const existingPay = await Payment.findOne({ transactionId }).session(session);
      if (!existingPay) {
        await Payment.create([{
          bookingId: booking._id,
          amount: booking.farePaise,
          paymentMethod: 'ONLINE',
          transactionId,
          gateway: gateway || booking.paymentGateway,
          paymentStatus: 'SUCCESS',
          refundStatus: 'PENDING',
          paidAt: new Date(),
        }], { session });
      }

      await session.commitTransaction();
      
      // Attempt refund asynchronously
      // Use idempotency / save provider refund ID
      createRefund({ transactionId, amountPaise: booking.farePaise, notes: { reason: 'Hold expired' }, receiptId: booking.bookingNumber })
        .then(async (refund) => {
           await Payment.updateOne({ transactionId }, { 
             refundStatus: refund.status === 'PROCESSED' ? 'PROCESSED' : 'PENDING',
             providerRefundId: refund.refundId
           });
           if(refund.status === 'PROCESSED') await Booking.updateOne({ _id: booking._id }, { paymentStatus: 'REFUNDED' });
        }).catch(err => console.error('Auto-refund failed:', err));

      return { success: false, reason: 'HOLD_EXPIRED', message: 'Seat hold expired before payment was processed. Your payment will be refunded.' };
    }

    // 5. Update Booking
    booking.bookingStatus = 'CONFIRMED';
    booking.paymentStatus = 'PAID';
    booking.paymentTransactionId = transactionId;
    booking.holdExpiresAt = null;
    await booking.save({ session });

    await auditBooking({
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        userId: booking.passengerId,
        eventType: 'BOOKING_CONFIRMED',
        previousBookingStatus: 'PENDING',
        newBookingStatus: 'CONFIRMED',
        previousPaymentStatus: 'PENDING',
        newPaymentStatus: 'PAID',
        source: gateway || 'SYSTEM',
        metadata: { transactionId },
        session
    });

    // 6. Record Payment
    const existingPay = await Payment.findOne({ transactionId }).session(session);
    if (!existingPay) {
      await Payment.create([{
        bookingId: booking._id,
        amount: booking.farePaise,
        paymentMethod: 'ONLINE',
        transactionId,
        gateway: gateway || booking.paymentGateway,
        paymentStatus: 'SUCCESS',
        paidAt: new Date(),
      }], { session });
    }

    // 7. Create Ticket EXACTLY ONCE
    const existingTicket = await Ticket.findOne({ bookingId: booking._id }).session(session);
    if (!existingTicket) {
      const newTkt = await Ticket.create([{
        bookingId: booking._id,
        ticketNumber: 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase()
      }], { session });
      await auditBooking({
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        userId: booking.passengerId,
        eventType: 'TICKET_CREATED',
        previousBookingStatus: 'CONFIRMED',
        newBookingStatus: 'CONFIRMED',
        previousPaymentStatus: 'PAID',
        newPaymentStatus: 'PAID',
        source: 'SYSTEM',
        metadata: { ticketNumber: newTkt[0].ticketNumber },
        session
      });
      // ── FEATURE 6: NOTIFICATIONS ───────────────────────────────────────────
      // Send notifications asynchronously outside the critical path
      const passenger = booking.passengerId; // This is an ObjectId, wait we need the populated user to get email/phone.
      // We will look up the passenger async since we don't want to break the transaction
      setImmediate(async () => {
        try {
          const { default: User } = await import('../../database/models/User.js');
          const p = await User.findById(booking.passengerId);
          if (!p) return;

          const basePayload = {
            userId: booking.passengerId,
            bookingId: booking._id,
            tripId: booking.tripId,
            eventType: 'BOOKING_CONFIRMED'
          };

          const textMessage = `Ente KSRTC: Booking confirmed.\nPNR: ${booking.bookingNumber}\nRoute: ${booking.boardingSequence} to ${booking.droppingSequence}\nSeat(s): Confirmed\nThank you for travelling with Ente KSRTC.`;

          if (p.email) {
            notificationService.dispatchNotification({
              ...basePayload,
              channel: 'EMAIL',
              recipient: p.email,
              subject: `Ente KSRTC Booking Confirmed - PNR ${booking.bookingNumber}`,
              message: textMessage
            });
          }

          if (p.phone) {
            notificationService.dispatchNotification({
              ...basePayload,
              channel: 'SMS',
              recipient: p.phone,
              message: textMessage
            });
            notificationService.dispatchNotification({
              ...basePayload,
              channel: 'WHATSAPP',
              recipient: p.phone,
              message: textMessage
            });
          }
        } catch (e) {
          console.error('Notification dispatch failed', e);
        }
      });
      // ───────────────────────────────────────────────────────────────────────

    }

    await session.commitTransaction();
    return { success: true, booking };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// ─── VERIFY PAYMENT (frontend callback after user completes payment) ──────────

export const verifyPaymentHandler = async (req, res) => {
  try {
    const { bookingId, orderId, paymentId, signature } = req.body;
    const userId = req.user.id || req.user._id;

    // ── Input guard ────────────────────────────────────────────────────────
    if (!bookingId || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing bookingId or orderId' });
    }

    // ── IDOR: only the booking owner can verify ────────────────────────────
    const booking = await Booking.findOne({ _id: bookingId, passengerId: userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // ── Idempotency: already paid (webhook may have processed first) ───────
    if (booking.paymentStatus === 'PAID' && booking.bookingStatus === 'CONFIRMED') {
      console.info('[VerifyPayment] Already confirmed (idempotent)', { bookingId, orderId });
      const seats = await BookingSeat.find({ bookingId: booking._id });
      return res.json({ success: true, message: 'Already confirmed', booking: { ...booking.toObject(), seats } });
    }

    // ── Reject invalid state transitions ──────────────────────────────────
    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(409).json({ success: false, message: 'Booking has been cancelled and cannot be paid' });
    }
    if (booking.paymentStatus === 'FAILED' && booking.bookingStatus !== 'PENDING') {
      return res.status(409).json({ success: false, message: 'Payment already failed for this booking' });
    }

    // ── Check hold expiry ─────────────────────────────────────────────────
    if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
      // Only update if still PENDING (avoid overwriting a concurrent PAID)
      if (booking.paymentStatus === 'PENDING') {
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'FAILED' });
      }
      return res.status(410).json({ success: false, message: 'Seat hold has expired. Please search again.' });
    }

    // ── Verify orderId matches what we issued ─────────────────────────────
    if (!booking.paymentOrderId || booking.paymentOrderId !== orderId) {
      return res.status(400).json({ success: false, message: 'Order ID mismatch' });
    }

    // ── Duplicate transaction ID protection ───────────────────────────────
    // Check if this paymentId was already used for ANY booking
    if (paymentId) {
      const existingPayment = await Payment.findOne({ transactionId: paymentId });
      if (existingPayment) {
        // If it's the SAME booking, that's the idempotent case (already handled above)
        // If it's a DIFFERENT booking, this is a replay attack
        if (String(existingPayment.bookingId) !== String(booking._id)) {
          console.warn('[VerifyPayment] Duplicate paymentId attempted on different booking', {
            paymentId, bookingId, existingBookingId: existingPayment.bookingId,
          });
          return res.status(409).json({ success: false, message: 'Payment ID already used for another booking' });
        }
      }
    }

    // ── Verify signature with payment provider ────────────────────────────
    const { verified, transactionId } = await verifyPayment({
      orderId,
      paymentId,
      signature,
      expectedOrderId: booking.paymentOrderId,
    });

    if (!verified) {
      // Mark FAILED only if the transition is valid (PENDING → FAILED)
      if (isValidPaymentTransition(booking.paymentStatus, 'FAILED')) {
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'FAILED' });
      }
      console.warn('[VerifyPayment] Signature verification failed', { bookingId, orderId });
      return res.status(402).json({ success: false, message: 'Payment verification failed' });
    }

    // ── Confirm booking (state: PENDING → PAID / CONFIRMED) ───────────────
    await Booking.findByIdAndUpdate(bookingId, {
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentTransactionId: transactionId,
      holdExpiresAt: null, // clear the hold
    });

    // Record in Payment collection — use findOneAndUpdate for idempotency
    const existingPay = await Payment.findOne({ transactionId });
    if (!existingPay) {
      await Payment.create({
        bookingId: booking._id,
        amount: booking.farePaise,
        paymentMethod: 'ONLINE',
        transactionId,
        gateway: booking.paymentGateway,
        paymentStatus: 'SUCCESS',
        paidAt: new Date(),
      });
    }

    console.info('[VerifyPayment] Booking confirmed', { bookingId, orderId, transactionId });

    const confirmedBooking = await Booking.findById(bookingId)
      .populate({ path: 'tripId', populate: { path: 'busId routeId' } })
      .populate('boardingStop droppingStop');
    const seats = await BookingSeat.find({ bookingId: booking._id });

    return res.json({
      success: true,
      message: 'Payment verified. Booking confirmed.',
      booking: { ...confirmedBooking.toObject(), seats },
    });
  } catch (error) {
    console.error('[VerifyPayment] Unexpected error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── WEBHOOK (payment provider → backend) ─────────────────────────────────────

export const handleWebhook = async (req, res) => {
  try {
    // Razorpay sends X-Razorpay-Signature; simulated provider uses X-Payment-Signature
    const signature = req.headers['x-razorpay-signature'] || req.headers['x-payment-signature'] || '';

    // rawBody MUST be the raw bytes — attached by express.json verify hook in app.js
    const rawBody = req.rawBody;
    if (!rawBody) {
      console.error('[Webhook] rawBody missing — check express.json verify hook in app.js');
      return res.status(400).json({ success: false, message: 'Raw body unavailable' });
    }

    // ── Signature verification (prevents forged webhooks) ─────────────────
    const isValid = verifyWebhookSignature({ rawBody, signature });
    if (!isValid) {
      console.warn('[Webhook] Invalid signature rejected');
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body;
    const eventType = event?.event || '';

    console.info('[Webhook] Received event:', eventType);

    // ── Handle payment.failed ─────────────────────────────────────────────
    if (eventType === 'payment.failed') {
      const paymentEntity = event?.payload?.payment?.entity;
      if (paymentEntity) {
        const { order_id: orderId } = paymentEntity;
        const booking = await Booking.findOne({ paymentOrderId: orderId });
        if (booking && booking.paymentStatus === 'PENDING') {
          await Booking.findByIdAndUpdate(booking._id, { paymentStatus: 'FAILED' });
          console.info('[Webhook] Booking marked FAILED via webhook', {
            bookingId: booking._id, orderId,
          });
        }
      }
      return res.status(200).json({ success: true, message: 'payment.failed handled' });
    }

    // ── Handle payment.captured and order.paid ────────────────────────────
    let paymentEntity = null;
    let orderId = null;
    let paymentId = null;

    if (eventType === 'payment.captured') {
      paymentEntity = event?.payload?.payment?.entity;
      if (paymentEntity) {
        orderId = paymentEntity.order_id;
        paymentId = paymentEntity.id;
      }
    } else if (eventType === 'order.paid') {
      paymentEntity = event?.payload?.payment?.entity;
      orderId = event?.payload?.order?.entity?.id;
      paymentId = paymentEntity?.id;
    } else if (event?.payment || event?.payload?.payment?.entity) {
      // Simulated / legacy format
      const entity = event?.payload?.payment?.entity || event?.payment;
      orderId = entity?.order_id;
      paymentId = entity?.id;
      const status = entity?.status;
      if (status !== 'captured' && status !== 'SUCCESS') {
        return res.status(200).json({ success: true, message: 'Payment not captured (ignored)' });
      }
    } else {
      return res.status(200).json({ success: true, message: 'Unhandled event type (ignored)' });
    }

    if (!orderId) {
      return res.status(200).json({ success: true, message: 'No orderId in webhook (ignored)' });
    }

    // Find booking by the orderId we stored
    const booking = await Booking.findOne({ paymentOrderId: orderId });
    if (!booking) {
      console.warn('[Webhook] No booking found for orderId', { orderId });
      return res.status(200).json({ success: true, message: 'Booking not found for this order (ignored)' });
    }

    // ── Idempotency: already confirmed ────────────────────────────────────
    if (booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID') {
      console.info('[Webhook] Already confirmed (idempotent)', { bookingId: booking._id, orderId });
      return res.status(200).json({ success: true, message: 'Already confirmed (idempotent)' });
    }

    // ── Reject invalid state transitions ──────────────────────────────────
    if (booking.bookingStatus === 'CANCELLED') {
      console.warn('[Webhook] Booking is CANCELLED, ignoring captured payment', { bookingId: booking._id });
      return res.status(200).json({ success: true, message: 'Booking cancelled (ignored)' });
    }

    // ── Confirm booking ────────────────────────────────────────────────────
    await Booking.findByIdAndUpdate(booking._id, {
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentTransactionId: paymentId,
      holdExpiresAt: null,
    });

    // Record payment — check for existing to avoid duplicates (unique index on transactionId)
    const existingPayment = await Payment.findOne({ transactionId: paymentId });
    if (!existingPayment) {
      await Payment.create({
        bookingId: booking._id,
        amount: booking.farePaise,
        paymentMethod: 'ONLINE',
        transactionId: paymentId,
        gateway: booking.paymentGateway,
        paymentStatus: 'SUCCESS',
        paidAt: new Date(),
      });
    }

    console.info('[Webhook] Booking confirmed via webhook', {
      bookingId: booking._id, orderId, paymentId, event: eventType,
    });

    return res.status(200).json({ success: true, message: 'Booking confirmed via webhook' });
  } catch (error) {
    // Always return 200 to payment provider to stop retries, but log the error
    console.error('[Webhook] Error:', error.message);
    return res.status(200).json({ success: true, message: 'Webhook received (error logged)' });
  }
};

// (Moved getUserBookings to views/bookingViewController.js)

// ─── RECONCILE PAYMENT ────────────────────────────────────────────────────────
export const reconcilePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id || req.user._id;

    const booking = await Booking.findOne({ _id: bookingId, passengerId: userId });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.bookingStatus === 'CONFIRMED') {
      return res.json({ success: true, message: 'Already confirmed', booking });
    }

    if (!booking.paymentOrderId) {
      return res.status(400).json({ success: false, message: 'No payment order associated' });
    }

    const { status, transactionId } = await getPaymentStatus({ orderId: booking.paymentOrderId });
    
    if (status === 'CAPTURED') {
      const result = await confirmBookingPayment({ bookingId: booking._id, transactionId, gateway: booking.paymentGateway });
      if (!result.success && result.reason === 'HOLD_EXPIRED') {
        return res.status(410).json({ success: false, message: result.message, booking: await Booking.findById(booking._id) });
      }
      return res.json({ success: true, message: 'Reconciled and confirmed', booking: await Booking.findById(booking._id) });
    } else if (status === 'FAILED') {
      booking.paymentStatus = 'FAILED';
      await booking.save();
      return res.json({ success: true, message: 'Reconciled as failed', booking });
    }

    return res.json({ success: true, message: 'Payment still pending', booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ─── HOLD EXPIRY CLEANUP (called periodically) ────────────────────────────────

/**
 * Marks expired PENDING bookings as FAILED.
 * Should be triggered by a scheduled job, NOT by payment verification.
 * Payment provider verification remains authoritative for payment success.
 */
export const cleanupExpiredHolds = async (req, res) => {
  try {
    const now = new Date();
    const result = await Booking.updateMany(
      {
        bookingStatus: 'PENDING',
        paymentStatus: 'PENDING',
        holdExpiresAt: { $lt: now, $ne: null },
      },
      {
        $set: { paymentStatus: 'FAILED' },
      }
    );
    const count = result.modifiedCount || 0;
    if (count > 0) {
      console.info(`[HoldCleanup] Marked ${count} expired holds as FAILED`);
    }
    if (res) {
      return res.json({ success: true, message: `Cleaned up ${count} expired holds` });
    }
  } catch (error) {
    console.error('[HoldCleanup] Error:', error.message);
    if (res) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};


// (Moved getBookingAudits to views/bookingViewController.js)
