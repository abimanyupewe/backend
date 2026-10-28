import express from "express";
import upload from "../middleware/multer.js";
import {
  addCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

import authorize, { ownOrAdmin } from "../middleware/authorize.js";

const router = express.Router();
const editors = ["superadmin", "admin", "mentor"];

router.post("/add", authorize(...editors), upload.single("thumbnail"), addCourse);
router.get("/all", getAllCourses);
router.get("/get", getCourse);
router.put("/update", authorize(...editors), updateCourse);
router.delete("/delete", authorize(...editors), deleteCourse);

export default router;
