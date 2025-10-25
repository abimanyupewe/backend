import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      value: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },
  ],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seller",
    required: true,
  },
  bestSeller: {
    type: Boolean,
    default: false,
  },
  voucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "voucher",
    default: null,
  },
  preOrder: {
    type: Boolean,
    default: false,
  },
  image: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "disabled"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// penamaan model
const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
