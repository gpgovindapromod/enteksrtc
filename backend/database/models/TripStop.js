import mongoose from 'mongoose';

const tripStopSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    routeStopId: { type: mongoose.Schema.Types.ObjectId, ref: 'RouteStop', required: true, index: true },

    arrivalTime: { type: Date },
    departureTime: { type: Date },

    platform: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('TripStop', tripStopSchema);
