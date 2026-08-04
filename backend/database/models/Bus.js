import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    busNumber: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true },
    
    depotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', index: true },
    
    busType: { type: String }, // e.g. 'AC Sleeper', 'Non-AC Sleeper'
    capacity: { type: Number },
    
    layoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusLayout' },
    
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], default: 'ACTIVE' }
  },
  { timestamps: true }
);

export default mongoose.model('Bus', busSchema);
