import mongoose from "mongoose";

const depotSchema = new mongoose.Schema(
  {
    depotCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    depotName: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    district: {
      type: String,
      required: true,
      trim: true
    },

    state: {
      type: String,
      required: true,
      default: "Kerala"
    },

    pincode: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    totalPlatforms: {
      type: Number,
      required: true,
      min: 1
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Depot = mongoose.model("Depot", depotSchema);

export default Depot;