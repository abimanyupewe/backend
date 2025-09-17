import express from "express";
import {
  registerMentor,
  loginMentor,
  getAllMentors,
  getMentor,
  updateMentor,
  deleteMentor,
} from "../controllers/mentorController.js";

const router = express.Router();

router.post("/register", registerMentor);
router.post("/login", loginMentor);
router.get("/all", getAllMentors);
router.get("/get/:id", getMentor);
router.put("/update/:id", updateMentor);
router.delete("/delete/:id", deleteMentor);

export default router;
