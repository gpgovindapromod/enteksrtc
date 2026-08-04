import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    action: { type: String, required: true },
    module: { type: String, required: true, index: true },
    description: { type: String },

    ipAddress: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
