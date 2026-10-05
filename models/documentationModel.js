import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
  image: { type: String },
  caption: { type: String },
});

const documentationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String },
    description: { type: String },
    category: { type: String },
    coverImage: { type: String },
    photos: [photoSchema],
  },
  { timestamps: true }
);

const documentationModel = mongoose.models.documentation || mongoose.model("documentation", documentationSchema);
export default documentationModel;
