import mongoose from "mongoose";

const agencyServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon_or_image: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AgencyService = mongoose.models.AgencyService || mongoose.model("AgencyService", agencyServiceSchema);

export default AgencyService;
