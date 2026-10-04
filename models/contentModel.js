import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  type: {
    type: String, // 'homepage'
    required: true,
    unique: true,
  },
  topBanner: {
    isActive: { type: Boolean, default: true },
    text: { type: String, default: "Promo Spesial Kemerdekaan Diskon 50%" },
    link: { type: String, default: "/store" },
    backgroundColor: { type: String, default: "#10b981" }, // emerald-500
    textColor: { type: String, default: "#ffffff" },
  },
  heroSliders: [
    {
      image: { type: String, required: true },
      title: { type: String, required: true },
      subtitle: { type: String },
      buttonText: { type: String, default: "Beli Sekarang" },
      buttonLink: { type: String, default: "/store" },
      isActive: { type: Boolean, default: true },
    }
  ],
  faqs: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
      isActive: { type: Boolean, default: true },
    }
  ]
}, { timestamps: true });

const contentModel = mongoose.models.content || mongoose.model("content", contentSchema);
export default contentModel;
