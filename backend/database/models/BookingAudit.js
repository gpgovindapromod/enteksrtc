import mongoose from 'mongoose';

const bookingAuditSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    bookingNumber: { type: String, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    
    eventType: { 
      type: String, 
      required: true,
      enum: [
        'BOOKING_CREATED',
        'PAYMENT_INITIATED',
        'PAYMENT_CAPTURED',
        'PAYMENT_VERIFIED',
        'BOOKING_CONFIRMED',
        'BOOKING_FAILED',
        'BOOKING_CANCELLED',
        'HOLD_EXPIRED',
        'PAYMENT_RECONCILED',
        'REFUND_REQUESTED',
        'REFUND_PROCESSING',
        'REFUND_COMPLETED',
        'REFUND_FAILED',
        'TICKET_CREATED',
        'ADMIN_ACTION'
      ]
    },
    
    previousBookingStatus: { type: String },
    newBookingStatus: { type: String },
    previousPaymentStatus: { type: String },
    newPaymentStatus: { type: String },
    
    source: { 
      type: String, 
      enum: ['USER', 'ADMIN', 'VERIFY_PAYMENT', 'WEBHOOK', 'RECONCILIATION', 'SYSTEM', 'CLEANUP'],
      required: true 
    },
    reason: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: { createdAt: true, updatedAt: false } } // Append-only, no updates
);

// Indexes for fast filtering
bookingAuditSchema.index({ eventType: 1, createdAt: -1 });
bookingAuditSchema.index({ source: 1 });

export default mongoose.model('BookingAudit', bookingAuditSchema);
