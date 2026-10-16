import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    platformFeePercentage: { type: Number, default: 20 },
    platformBankAccounts: [
      {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountName: { type: String, required: true },
      }
    ],
  },
  { timestamps: true }
);

const settingModel = mongoose.models.setting || mongoose.model("setting", settingSchema);

export default settingModel;
