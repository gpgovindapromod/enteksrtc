import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    amount: { type: Number, required: true },

    paymentMethod: { type: String }, // e.g. 'UPI', 'CREDIT_CARD'
    transactionId: { type: String, unique: true, sparse: true },
    gateway: { type: String },

    paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },

    refundAmount: { type: Number, default: 0 },
    refundStatus: { type: String, enum: ['NOT_APPLICABLE', 'PENDING', 'PROCESSED'], default: 'NOT_APPLICABLE' },

    paidAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
