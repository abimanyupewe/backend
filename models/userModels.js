import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    isVerifed: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      trim: true,
    },
    otpExpired: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "seller", "mentor"],
      default: "user",
    },
    cartData: {
      type: Array,
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    minimize: false,
  }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
