import Booking from '../../database/models/Booking.js';
import Payment from '../../database/models/Payment.js';
import { auditBooking } from '../../utils/auditUtils.js';
import { evaluateCancellation } from '../../utils/cancellationPolicy.js';
import { createRefund } from '../../services/paymentService.js';
import { creditWallet } from '../walletController.js';

// ─── CANCEL BOOKING ────────────────────────────────────────────────────────────

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    // IDOR: only the owner or an admin can cancel
    const query = { _id: bookingId };
    if (userRole !== 'ADMIN' && userRole !== 'STATION_MASTER') {
      query.passengerId = userId;
    }

    const booking = await Booking.findOne(query).populate('tripId');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Check if trip has already started/departed
    const now = new Date();
    if (booking.tripId) {
      const tripStarted = ['DEPARTED', 'COMPLETED'].includes(booking.tripId.status) || 
        (booking.tripId.departureDate && now >= new Date(booking.tripId.departureDate));
      if (tripStarted) {
        return res.status(400).json({ success: false, message: 'Cancellation is not permitted after the trip has started.' });
      }
    }

    const prevBookingStatus = booking.bookingStatus;
    const prevPaymentStatus = booking.paymentStatus;
    
    // Evaluate cancellation policy
    let refundAmountToProcess = 0;
    
    if (booking.paymentStatus === 'PAID') {
      const policy = evaluateCancellation(booking, booking.tripId);
      if (!policy.eligible) {
        return res.status(400).json({ success: false, message: policy.reason });
      }
      
      booking.cancellationFeePaise = policy.cancellationFeePaise;
      booking.refundAmountPaise = policy.refundAmountPaise;
      refundAmountToProcess = policy.refundAmountPaise;
    }

    booking.bookingStatus = 'CANCELLED';
    booking.holdExpiresAt = null;

    if (booking.paymentStatus === 'PAID') {
      booking.paymentStatus = 'REFUND_REQUESTED';
      await booking.save();
      
      await auditBooking({
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        userId: booking.passengerId,
        eventType: 'BOOKING_CANCELLED',
        previousBookingStatus: prevBookingStatus,
        newBookingStatus: 'CANCELLED',
        previousPaymentStatus: prevPaymentStatus,
        newPaymentStatus: 'REFUND_REQUESTED',
        source: 'USER',
        reason: 'User cancelled booking (Eligible for refund)'
      });

      const payment = await Payment.findOne({ bookingId: booking._id, paymentStatus: 'SUCCESS' });
      if (payment && payment.transactionId) {
        // Only attempt if refundAmount is > 0 and no refund initiated yet
        if (refundAmountToProcess > 0) {
          if (payment.refundStatus === 'PROCESSED' || payment.refundStatus === 'PENDING') {
            console.info('Refund already exists for booking', booking._id);
          } else {
            try {
              const refund = await createRefund({ 
                transactionId: payment.transactionId, 
                amountPaise: refundAmountToProcess, 
                receiptId: booking.bookingNumber 
              });
              
              payment.refundStatus = refund.status === 'PROCESSED' ? 'PROCESSED' : 'PENDING';
              payment.providerRefundId = refund.refundId;
              payment.refundAmount = refundAmountToProcess; // save in Payment too
              await payment.save();
              
              if (refund.status === 'PROCESSED') {
                 booking.paymentStatus = 'REFUNDED';
                 await booking.save();
              }
            } catch (err) {
              console.error('Refund initiation failed:', err);
            }
          }

          if (payment.refundStatus === 'PROCESSED') {
            try {
              await creditWallet({
                userId: booking.passengerId,
                amountPaise: refundAmountToProcess,
                referenceId: `BOOKING_REFUND:${booking._id}`,
                description: `Refund for cancelled booking #${booking.bookingNumber}`,
                metadata: { bookingId: booking._id, bookingNumber: booking.bookingNumber },
              });
            } catch (walletError) {
              console.error('Wallet refund credit failed:', walletError);
            }
          }
        } else {
           // If refundAmount is 0 (e.g. 100% cancellation fee)
           booking.paymentStatus = 'REFUNDED'; // Or maybe 'NO_REFUND' but we stick to existing states
           payment.refundStatus = 'NOT_APPLICABLE';
           await booking.save();
           await payment.save();
        }
      }
    } else {
      await booking.save();
      await auditBooking({
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        userId: booking.passengerId,
        eventType: 'BOOKING_CANCELLED',
        previousBookingStatus: prevBookingStatus,
        newBookingStatus: 'CANCELLED',
        previousPaymentStatus: prevPaymentStatus,
        newPaymentStatus: booking.paymentStatus,
        source: 'USER',
        reason: 'User cancelled booking (unpaid)'
      });
    }

    // Fetch seat numbers for notifications & manifests
    let seatList = [];
    try {
      const BookingSeat = (await import('../../database/models/BookingSeat.js')).default;
      const seats = await BookingSeat.find({ bookingId: booking._id });
      seatList = seats.map(s => s.seatNo);
    } catch (e) {
      console.warn('[CancelBooking] Could not fetch seat numbers:', e.message);
    }
    const seatString = seatList.length > 0 ? seatList.join(', ') : 'Seats';

    // ── Safe Asynchronous Notification Dispatch ────────────────────────────────
    setImmediate(async () => {
      try {
        const { notificationService } = await import('../../services/notificationService.js');
        const User = (await import('../../database/models/User.js')).default;
        const Trip = (await import('../../database/models/Trip.js')).default;

        const passenger = await User.findById(booking.passengerId);
        const trip = await Trip.findById(booking.tripId).populate('busId routeId conductorId');

        const refundFormatted = (refundAmountToProcess / 100).toFixed(2);
        const refundStatusDesc = refundAmountToProcess > 0 ? `Refund of ₹${refundFormatted} initiated.` : 'No refund applicable.';

        // 1. Notify Passenger (IN_APP, EMAIL, SMS)
        if (passenger) {
          const passengerMsg = `Your booking #${booking.bookingNumber} (${seatString}) has been cancelled. ${refundStatusDesc}`;
          
          await notificationService.dispatchNotification({
            userId: passenger._id,
            bookingId: booking._id,
            tripId: booking.tripId,
            channel: 'IN_APP',
            eventType: 'BOOKING_CANCELLED',
            recipient: String(passenger._id),
            title: 'Booking Cancelled',
            subject: `Ente KSRTC: Booking Cancelled - #${booking.bookingNumber}`,
            message: passengerMsg,
            metadata: { bookingNumber: booking.bookingNumber, refundAmountPaise: refundAmountToProcess }
          });

          if (passenger.email) {
            notificationService.dispatchNotification({
              userId: passenger._id,
              bookingId: booking._id,
              tripId: booking.tripId,
              channel: 'EMAIL',
              eventType: 'BOOKING_CANCELLED',
              recipient: passenger.email,
              subject: `Ente KSRTC: Booking Cancelled - #${booking.bookingNumber}`,
              message: passengerMsg
            });
          }

          if (passenger.phone) {
            notificationService.dispatchNotification({
              userId: passenger._id,
              bookingId: booking._id,
              tripId: booking.tripId,
              channel: 'SMS',
              eventType: 'BOOKING_CANCELLED',
              recipient: passenger.phone,
              message: passengerMsg
            });
          }
        }

        // 2. Notify Station Master(s) of the bus depot
        if (trip?.busId?.depotId) {
          const depotStationMasters = await User.find({
            depotId: trip.busId.depotId,
            role: 'STATION_MASTER',
            isActive: true
          });

          const smMessage = `Booking #${booking.bookingNumber} cancelled. Seat(s) ${seatString} released on Trip ${trip.routeId?.routeNumber || ''} (${trip.busId?.registrationNumber || 'Bus'}).`;
          
          for (const sm of depotStationMasters) {
            await notificationService.dispatchNotification({
              userId: sm._id,
              bookingId: booking._id,
              tripId: trip._id,
              channel: 'IN_APP',
              eventType: 'SEATS_RELEASED',
              recipient: String(sm._id),
              title: 'Seat(s) Released',
              subject: `Seats Released on Trip ${trip.routeId?.routeNumber || ''}`,
              message: smMessage,
              metadata: { tripId: trip._id, seats: seatList, depotId: trip.busId.depotId }
            });
          }
        }

        // 3. Notify Conductor if assigned to the trip
        if (trip?.conductorId) {
          const conductor = trip.conductorId;
          const conductorMsg = `Manifest update: Seat(s) ${seatString} cancelled for Booking #${booking.bookingNumber} on your assigned trip.`;

          await notificationService.dispatchNotification({
            userId: conductor._id,
            bookingId: booking._id,
            tripId: trip._id,
            channel: 'IN_APP',
            eventType: 'MANIFEST_UPDATED',
            recipient: String(conductor._id),
            title: 'Manifest Update',
            subject: `Manifest update: Seat(s) ${seatString} cancelled`,
            message: conductorMsg,
            metadata: { tripId: trip._id, seats: seatList }
          });
        }
      } catch (notifErr) {
        console.error('[CancelBooking] Notification dispatch error:', notifErr);
      }
    });

    console.info('[CancelBooking] Cancelled', { bookingId, userId, paymentStatus: booking.paymentStatus });

    return res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        refundAmountPaise: booking.refundAmountPaise || 0,
        cancellationFeePaise: booking.cancellationFeePaise || 0
      }
    });
  } catch (error) {
    console.error('[cancelBooking] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCancellationPreview = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      passengerId: userId,
    }).populate('tripId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.json({
        success: true,
        eligible: false,
        reason: 'Booking is already cancelled',
        refundAmountPaise: booking.refundAmountPaise || 0,
        cancellationFeePaise: booking.cancellationFeePaise || 0,
      });
    }

    const tripStarted = booking.tripId && (
      ['DEPARTED', 'COMPLETED'].includes(booking.tripId.status) ||
      (booking.tripId.departureDate && new Date() >= new Date(booking.tripId.departureDate))
    );

    if (tripStarted) {
      return res.json({
        success: true,
        eligible: false,
        reason: 'Cancellation is not permitted after the trip has started.',
        refundAmountPaise: 0,
        cancellationFeePaise: booking.farePaise || booking.totalFare || 0,
      });
    }

    if (booking.paymentStatus !== 'PAID') {
      return res.json({
        success: true,
        eligible: true,
        reason: 'Booking can be cancelled without a refund.',
        refundAmountPaise: 0,
        cancellationFeePaise: 0,
      });
    }

    const policy = evaluateCancellation(booking, booking.tripId);
    return res.json({
      success: true,
      eligible: policy.eligible,
      reason: policy.reason,
      refundAmountPaise: policy.refundAmountPaise,
      cancellationFeePaise: policy.cancellationFeePaise,
    });
  } catch (error) {
    console.error('[getCancellationPreview] Error:', error);
    return res.status(500).json({ success: false, message: 'Unable to calculate cancellation details.' });
  }
};
