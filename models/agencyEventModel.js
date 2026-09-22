import mongoose from "mongoose";

const agencyEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    event_date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    image_path: { type: String, default: null },
  },
  { timestamps: true }
);

const AgencyEvent = mongoose.models.AgencyEvent || mongoose.model("AgencyEvent", agencyEventSchema);

export default AgencyEvent;
