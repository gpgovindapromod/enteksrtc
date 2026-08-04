import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    conductorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    departureDate: { type: Date, required: true, index: true },
    arrivalDate: { type: Date },

    fare: { type: Number },
    status: { type: String, enum: ['SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED', index: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
