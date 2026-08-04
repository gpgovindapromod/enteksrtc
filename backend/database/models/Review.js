import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
