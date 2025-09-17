import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: String,
  discountType: {
    type: String,
    enum: ["percent", "amount"],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minPurchase: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: null,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: null, // null = unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seller",
    required: false, // jika voucher khusus seller tertentu
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: false, // jika voucher khusus produk tertentu
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const voucherModel = mongoose.models.voucher || mongoose.model("voucher", voucherSchema);

export default voucherModel;