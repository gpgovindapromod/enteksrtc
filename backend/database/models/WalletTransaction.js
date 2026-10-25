import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    type: { type: String, enum: ['REFUND', 'CREDIT', 'DEBIT'], required: true },
    amountPaise: { type: Number, required: true, min: 1 },
    balanceAfterPaise: { type: Number, required: true, min: 0 },
    referenceType: { type: String, enum: ['BOOKING_REFUND', 'MANUAL', 'BOOKING_PAYMENT'], required: true },
    referenceId: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('WalletTransaction', walletTransactionSchema);
