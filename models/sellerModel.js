import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    phone: {
      type: Number,
    },
    email: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    productCount: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    profileImage: {
      type: String,
    },
    isVerifed: { type: Boolean, default: false },
    otp: {
      type: String,
      trim: true,
    },
    otpExpired: {
      type: Date,
    },
    isOfficial: { type: Boolean, default: false },
    status: {
      type: Boolean,
      default: true,
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

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
