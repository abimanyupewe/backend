import express from "express";
import upload from "../middleware/multer.js";
import {
  addCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/add", upload.single("thumbnail"), addCourse);
router.get("/all", getAllCourses);
router.get("/get", getCourse);
router.put("/update", updateCourse);
router.delete("/delete", deleteCourse);

export default router;
