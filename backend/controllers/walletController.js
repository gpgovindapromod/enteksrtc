import Wallet from '../database/models/Wallet.js';
import WalletTransaction from '../database/models/WalletTransaction.js';

const getUserId = (req) => req.user.id || req.user._id;

export const getWallet = async (req, res) => {
  try {
    const userId = getUserId(req);
    const wallet = await Wallet.findOne({ userId }).lean();
    const transactions = await WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      wallet: wallet || { balancePaise: 0 },
      transactions,
    });
  } catch (error) {
    console.error('[Wallet] Failed to fetch wallet:', error);
    return res.status(500).json({ success: false, message: 'Unable to load wallet.' });
  }
};

export const creditWallet = async ({ userId, amountPaise, referenceId, referenceType = 'BOOKING_REFUND', description, metadata }) => {
  if (!userId || !Number.isInteger(amountPaise) || amountPaise <= 0 || !referenceId) {
    throw new Error('Invalid wallet credit details');
  }

  const existing = await WalletTransaction.findOne({ referenceId });
  if (existing) return existing;

  const wallet = await Wallet.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId }, $inc: { balancePaise: amountPaise } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  try {
    return await WalletTransaction.create({
      userId,
      walletId: wallet._id,
      type: referenceType === 'BOOKING_REFUND' ? 'REFUND' : 'CREDIT',
      amountPaise,
      balanceAfterPaise: wallet.balancePaise,
      referenceType,
      referenceId,
      description: description || 'Wallet credit',
      metadata,
    });
  } catch (error) {
    if (error?.code === 11000) {
      await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balancePaise: -amountPaise } });
      return WalletTransaction.findOne({ referenceId });
    }
    await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balancePaise: -amountPaise } });
    throw error;
  }
};
