import express from "express";
import {
  registerMentor,
  loginMentor,
  getAllMentors,
  getMentor,
  updateMentor,
  deleteMentor,
  verifyMentorOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/mentorController.js";
import upload from "../middleware/multer.js";

import authorize, { ownOrAdmin } from "../middleware/authorize.js";

const router = express.Router();

router.post("/register", registerMentor);
router.post("/login", loginMentor);
router.get("/all", getAllMentors);
router.get("/get/:id", getMentor);
router.put("/update", authorize("superadmin", "admin", "mentor"), ownOrAdmin, upload.fields([{ name: "profileImage", maxCount: 1 }, { name: "certificates"}]), updateMentor);
router.delete("/delete/:id", authorize("superadmin", "admin"), deleteMentor);
router.post("/verify-otp", verifyMentorOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
