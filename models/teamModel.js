import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    division: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const teamModel = mongoose.models.team || mongoose.model("team", teamSchema);
export default teamModel;
