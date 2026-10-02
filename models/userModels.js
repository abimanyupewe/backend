import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    addresses: [
      {
        label: { type: String, default: "Rumah" },
        recipientName: { type: String, trim: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        landmark: { type: String, trim: true, default: "" },
        province: { type: String, trim: true, default: "" },
        city: { type: String, trim: true, default: "" },
        district: { type: String, trim: true, default: "" },
        village: { type: String, trim: true, default: "" },
        postalCode: { type: String, trim: true, default: "" },
        isDefault: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
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
      enum: ["user", "seller", "mentor", "admin"],
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
