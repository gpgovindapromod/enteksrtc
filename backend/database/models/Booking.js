import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: { type: String, required: true, unique: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },

    boardingStop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop' },
    droppingStop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop' },

    boardingSequence: { type: Number, required: true },
    droppingSequence: { type: Number, required: true },

    distanceKm: { type: Number },

    // farePaise: authoritative server-calculated amount in paise (INR smallest unit).
    // ₹100 = 10000 paise. NEVER accept this value from frontend.
    farePaise: { type: Number },

    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    totalFare: { type: Number, required: true },

    bookingStatus: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'PENDING' },

    // Payment state machine:
    //   PENDING  → initial state
    //   PAID     → after successful signature verification
    //   FAILED   → verification failed or hold expired
    //   REFUNDED → booking cancelled after payment (database status only;
    //              actual Razorpay refund is done via Razorpay dashboard in TEST MODE)
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },

    // Payment provider references (server-generated, NEVER from frontend)
    // paymentOrderId: Razorpay order ID (or SIM_ORD_... for SIMULATED)
    paymentOrderId: { type: String, sparse: true, index: true },

    // paymentTransactionId: Razorpay payment ID confirmed after verification
    paymentTransactionId: { type: String, sparse: true },

    paymentGateway: { type: String, default: 'SIMULATED' },

    // Temporary seat hold — expires if payment never comes
    holdExpiresAt: { type: Date, index: true },
  },
  { timestamps: true }
);

// Compound index for the seat overlap check (used in checkout)
bookingSchema.index({
  tripId: 1,
  bookingStatus: 1,
  paymentStatus: 1,
  boardingSequence: 1,
  droppingSequence: 1,
  holdExpiresAt: 1,
});

// Index for webhook/verify lookup by paymentOrderId
bookingSchema.index({ paymentOrderId: 1 }, { sparse: true });

export default mongoose.model('Booking', bookingSchema);
