import express from "express";
import authorize from "../middleware/authorize.js";
import { createMidtransTransaction } from "../controllers/payment/midtransController.js";

const midtransRouter = express.Router();

// Endpoint config agar frontend tidak perlu menyimpan clientKey di .env
midtransRouter.get("/config", (req, res) => {
  res.json({
    success: true,
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    isProduction: false,
    snapUrl: "https://app.sandbox.midtrans.com/snap/snap.js",
  });
});

midtransRouter.post("/", authorize("user"), createMidtransTransaction);

export default midtransRouter;