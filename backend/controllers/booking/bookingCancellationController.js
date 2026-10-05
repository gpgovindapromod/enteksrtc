import Booking from '../../database/models/Booking.js';
import Payment from '../../database/models/Payment.js';
import { auditBooking } from '../../utils/auditUtils.js';
import { evaluateCancellation } from '../../utils/cancellationPolicy.js';
import { createRefund } from '../../services/paymentService.js';

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

    console.info('[CancelBooking] Cancelled', { bookingId, userId, paymentStatus: booking.paymentStatus });

    return res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('[cancelBooking] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
