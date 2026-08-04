import mongoose from 'mongoose';

const seatAvailabilitySchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    seatNo: { type: String, required: true },

    status: { type: String, enum: ['AVAILABLE', 'BOOKED', 'BLOCKED'], default: 'AVAILABLE', index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  },
  { timestamps: true }
);

seatAvailabilitySchema.index({ tripId: 1, seatNo: 1 }, { unique: true });

export default mongoose.model('SeatAvailability', seatAvailabilitySchema);
