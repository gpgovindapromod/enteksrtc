import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
        role: {
            type: String,
            enum: ["USER", "ADMIN", "DRIVER", "CONDUCTOR", "STAFF"],
            default: "USER",
            index: true
        },
        depotId: { type: mongoose.Schema.Types.ObjectId, ref: "Depot" },

        fullName: { type: String, trim: true },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, trim: true },

        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        phone: { type: String, unique: true, sparse: true, trim: true },

        password: { type: String, required: true, select: false },

        age: { type: Number, min: 0 },
        employeeId: { type: String, trim: true },

        gender: { type: String, enum: ["Male", "Female", "Other"] },
        dob: { type: Date },

        profileImage: { type: String },

        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

userSchema.index({ roleId: 1 });
userSchema.index({ depotId: 1 });

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
    const user = this.toObject ? this.toObject() : { ...this };
    delete user.password;
    return user;
};

export default mongoose.model("User", userSchema);
