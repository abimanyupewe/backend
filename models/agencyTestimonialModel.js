import mongoose from "mongoose";

const agencyTestimonialSchema = new mongoose.Schema(
  {
    client_name: { type: String, required: true },
    company: { type: String, default: null },
    content: { type: String, required: true },
    is_published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AgencyTestimonial = mongoose.models.AgencyTestimonial || mongoose.model("AgencyTestimonial", agencyTestimonialSchema);

export default AgencyTestimonial;
