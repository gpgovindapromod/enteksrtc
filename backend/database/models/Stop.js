import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema(
  {
    stopName: { type: String, required: true, index: true },
    district: { type: String, index: true },
    state: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.model('Stop', stopSchema);
