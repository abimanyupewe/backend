import express from "express";
import {
  registerSeller,
  listSellers,
  updateSeller,
  removeSeller,
  singleSeller,
  verifySellerOTP,
  loginSeller,
} from "../controllers/sellerController.js";
import upload from "../middleware/multer.js";

const sellerRouter = express.Router();

sellerRouter.post("/login", loginSeller);
sellerRouter.post("/register", registerSeller);
sellerRouter.get("/list", listSellers);
sellerRouter.put("/update", upload.fields([{ name: "profileImage", maxCount: 1 }]), updateSeller);
sellerRouter.delete("/remove", removeSeller);
sellerRouter.get("/single", singleSeller);
sellerRouter.post("/verify-otp", verifySellerOTP);

export default sellerRouter;
