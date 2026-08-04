import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    depotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot' },

    firstName: { type: String, required: true },
    lastName: { type: String },

    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    employeeId: { type: String },

    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    dob: { type: Date },

    profileImage: { type: String },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Indexes defined implicitly by `unique: true` on email and phone.
userSchema.index({ roleId: 1 });
userSchema.index({ depotId: 1 });

export default mongoose.model('User', userSchema);
