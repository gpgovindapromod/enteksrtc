import mongoose from 'mongoose';

const routeStopSchema = new mongoose.Schema(
  {
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true, index: true },
    
    sequence: { type: Number, required: true },
    distanceFromSource: { type: Number }
  },
  { timestamps: true }
);

routeStopSchema.index({ routeId: 1, sequence: 1 }, { unique: true });

export default mongoose.model('RouteStop', routeStopSchema);
