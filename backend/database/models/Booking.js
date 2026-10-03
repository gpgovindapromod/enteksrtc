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
    farePaise: { type: Number },

    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    totalFare: { type: Number, required: true },

    bookingStatus: { type: String, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'], default: 'PENDING' },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },

    // Payment provider reference (server-generated, never from frontend)
    paymentOrderId: { type: String, sparse: true },
    paymentTransactionId: { type: String, sparse: true },
    paymentGateway: { type: String, default: 'SIMULATED' },

    // Temporary seat hold — expires if payment never comes
    holdExpiresAt: { type: Date, index: true }
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
