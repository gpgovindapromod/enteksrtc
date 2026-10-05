import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    
    channel: { 
      type: String, 
      enum: ['EMAIL', 'SMS', 'WHATSAPP'], 
      required: true 
    },
    
    eventType: { 
      type: String, 
      required: true,
      enum: [
        'BOOKING_CREATED',
        'BOOKING_CONFIRMED',
        'TICKET_CREATED',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'BOOKING_CANCELLED',
        'REFUND_REQUESTED',
        'REFUND_PROCESSED',
        'REFUND_FAILED',
        'TRIP_CANCELLED',
        'TIMETABLE_CHANGED'
      ]
    },
    
    recipient: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    
    status: { 
      type: String, 
      enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED'], 
      default: 'PENDING' 
    },
    
    provider: { type: String, default: 'SIMULATED' },
    providerMessageId: { type: String },
    
    attempts: { type: Number, default: 0 },
    sentAt: { type: Date },
    failureReason: { type: String },
    
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

// Idempotency: Prevent duplicate notifications for the same event and channel per booking
notificationSchema.index({ bookingId: 1, eventType: 1, channel: 1 }, { unique: true, sparse: true });

export default mongoose.model('Notification', notificationSchema);
