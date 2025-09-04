import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
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
    isOfficial: { type: Boolean, default: false },
    status: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
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
    timestamps: true,
  }
);

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
