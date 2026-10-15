import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    
    channel: { 
      type: String, 
      enum: ['EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'], 
      required: true,
      default: 'IN_APP'
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
        'TIMETABLE_CHANGED',
        'MANIFEST_UPDATED',
        'SEATS_RELEASED',
        'DEPARTURE_REMINDER'
      ]
    },
    
    recipient: { type: String, required: true },
    title: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },

    status: { 
      type: String, 
      enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED'], 
      default: 'SENT' 
    },
    
    provider: { type: String, default: 'INTERNAL' },
    providerMessageId: { type: String },
    
    attempts: { type: Number, default: 0 },
    sentAt: { type: Date, default: Date.now },
    failureReason: { type: String },
    
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

// Idempotency: Prevent duplicate notifications for the same event, recipient, and channel per booking
// Includes recipient and userId so passenger, conductor, and station master can all receive notifications for the same booking event
notificationSchema.index({ bookingId: 1, eventType: 1, recipient: 1, channel: 1 }, { unique: true, sparse: true });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);
