import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);
