import mongoose from "mongoose";

const spinWheelSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String }, // gambar roda (opsional)
    link: { type: String }, // link ke halaman spin (opsional)
    isActive: { type: Boolean, default: true },

    // Daftar hadiah pada roda
    prizes: [
      {
        label: { type: String, required: true }, // Nama hadiah
        value: { type: Number, required: true }, // Nilai hadiah (misal: poin, diskon, dsb)
        type: {
          type: String,
          enum: ["point", "voucher", "item", "other"],
          default: "point",
        },
        image: { type: String }, // gambar hadiah (opsional)
        probability: { type: Number, default: 1 }, // peluang (bobot) hadiah
        stock: { type: Number, default: null }, // jika hadiah terbatas
      },
    ],

    // Batasan main
    maxSpinPerUser: { type: Number, default: 1 }, // berapa kali user boleh spin
    startDate: { type: Date },
    endDate: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const spinWheelModel =
  mongoose.models.spinWheel || mongoose.model("spinWheel", spinWheelSchema);

export default spinWheelModel;
