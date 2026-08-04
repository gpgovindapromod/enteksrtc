import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    routeNumber: { type: String, required: true, unique: true },
    routeName: { type: String, required: true },

    sourceStop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true, index: true },
    destinationStop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true, index: true },

    totalDistance: { type: Number },
    estimatedDuration: { type: Number },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Route', routeSchema);
