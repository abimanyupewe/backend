import mongoose from "mongoose";

const agencyFaqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AgencyFaq = mongoose.models.AgencyFaq || mongoose.model("AgencyFaq", agencyFaqSchema);

export default AgencyFaq;
