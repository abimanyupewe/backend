import mongoose from "mongoose";

const agencyTeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    image_path: { type: String, default: null },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AgencyTeam = mongoose.models.AgencyTeam || mongoose.model("AgencyTeam", agencyTeamSchema);

export default AgencyTeam;
