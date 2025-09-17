import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  subcategories: [
    {
      name: { type: String, required: true, trim: true },
      // Bisa tambah field lain jika perlu
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
  createdAt: { type: Date, default: Date.now },
});

const categoryModel =
  mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;
