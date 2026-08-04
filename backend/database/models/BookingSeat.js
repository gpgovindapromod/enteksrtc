import mongoose from 'mongoose';

const bookingSeatSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    seatNo: { type: String, required: true },

    passengerName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] }
  },
  { timestamps: true }
);

export default mongoose.model('BookingSeat', bookingSeatSchema);
