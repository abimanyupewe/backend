import express from "express";
import {
  registerMentor,
  loginMentor,
  getAllMentors,
  getMentor,
  updateMentor,
  deleteMentor,
  verifyMentorOtp,
} from "../controllers/mentorController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/register", registerMentor);
router.post("/login", loginMentor);
router.get("/all", getAllMentors);
router.get("/get/:id", getMentor);
router.put("/update", upload.fields([{ name: "profileImage", maxCount: 1 }, { name: "certificates"}]), updateMentor);
router.delete("/delete/:id", deleteMentor);
router.post("/verify-otp", verifyMentorOtp);

export default router;
