import mongoose from "mongoose";

const agencyProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image_path: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

const AgencyProduct = mongoose.models.AgencyProduct || mongoose.model("AgencyProduct", agencyProductSchema);

export default AgencyProduct;
