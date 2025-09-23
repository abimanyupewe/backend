import { v2 as cloudinary } from "cloudinary";
import courseModel from "../models/courseModel.js";
import mentorModel from "../models/mentorModel.js";

const addCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      mentor,
      price,
      discountPrice,
      thumbnail,
      category,
      level,
      duration,
      benefits,
      modules,
    } = req.body;

    // Validasi sederhana
    if (!title || !description || !mentor || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    let thumbnailUrl = thumbnail;
    const image = req.files;
    if (image) {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
      });
      thumbnailUrl = result.secure_url;
    }

    const course = new courseModel({
      title,
      description,
      mentor,
      price,
      discountPrice,
      thumbnail: thumbnailUrl,
      category,
      level,
      duration,
      benefits,
      modules,
      totalModules: modules ? modules.length : 0,
    });

    // Tambah courseCount pada mentor
    await mentorModel.findByIdAndUpdate(mentor, {
      $inc: { courseCount: 1 },
    });

    await course.save();

    res.status(201).json({ success: true, message: "Course created", course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await courseModel.find();
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourse = async (req, res) => {
  try {
    const { id } = req.body;

    const course = await courseModel.findById(id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id, updates } = req.body;

    const course = await courseModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course updated", course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.body;

    // Ambil course dulu
    const course = await courseModel.findById(id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const mentorId = course.mentor;

    // Hapus course
    await courseModel.findByIdAndDelete(id);

    // Kurangi courseCount pada mentor
    await mentorModel.findByIdAndUpdate(mentorId, {
      $inc: { courseCount: -1 },
    });

    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addCourse, getAllCourses, getCourse, updateCourse, deleteCourse };
