import mongoose from "mongoose";

// Lesson Schema
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["video", "article", "quiz", "assignment"],
    required: true,
  },
  duration: { type: String },
  order: { type: Number },
  isPreview: { type: Boolean, default: false },
  thumbnail: { type: String },
  description: { type: String },
  content: { type: mongoose.Schema.Types.Mixed }, // fleksibel untuk berbagai tipe konten
});

// Resource Schema
const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  size: { type: String },
  url: { type: String },
  description: { type: String },
});

// Module Schema
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String },
  description: { type: String },
  order: { type: Number },
  lessons: [lessonSchema],
  resources: [resourceSchema],
});

// Course Schema
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "mentor",
    required: true,
  },
  price: { type: Number, default: 0 },
  discountPrice: { type: Number },
  thumbnail: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
  level: { type: String },
  duration: { type: String },
  totalStudents: { type: Number, default: 0 },
  totalModules: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      value: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },
  ],
  benefits: [String],
  modules: [moduleSchema],
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const courseModel =
  mongoose.models.course || mongoose.model("course", courseSchema);

export default courseModel;
