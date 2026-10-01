import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  type: { type: String, enum: ["product", "course"], default: "product" },
  image: { type: Array, default: [] },
  thumbnail: { type: String },
  category: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    items: [orderItemSchema],
    amount: {
      type: Number,
      required: true,
    },
    address: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "success", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "Midtrans",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
