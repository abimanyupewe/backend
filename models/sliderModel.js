import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    textBtn1: {
      type: String,
      required: true,
    },
    textBtn2: {
      type: String,
      required: true,
    },
    linkBtn1: {
      type: String,
      required: true,
    },
    linkBtn2: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const sliderModel =
  mongoose.models.slider || mongoose.model("slider", sliderSchema);

export default sliderModel;
