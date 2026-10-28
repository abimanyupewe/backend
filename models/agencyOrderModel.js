import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "AgencyProduct", required: true },
  quantity: { type: Number, required: true },
  price_at_checkout: { type: Number, required: true },
});

const agencyOrderSchema = new mongoose.Schema(
  {
    invoice_number: { type: String, required: true, unique: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, default: null },
    customer_phone: { type: String, required: true },
    notes: { type: String, default: null },
    total_amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processed", "completed", "canceled"],
      default: "pending",
    },
    items: [orderItemSchema],
  },
  { timestamps: true }
);

const AgencyOrder = mongoose.models.AgencyOrder || mongoose.model("AgencyOrder", agencyOrderSchema);

export default AgencyOrder;
