import mongoose from 'mongoose';

const depotSchema = new mongoose.Schema(
  {
    depotCode: { type: String, required: true, unique: true },
    depotName: { type: String, required: true, index: true },

    address: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },

    latitude: { type: Number },
    longitude: { type: Number },

    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    phone: { type: String },
    email: { type: String },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Depot', depotSchema);
