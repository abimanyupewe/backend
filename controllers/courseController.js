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

    const course = new courseModel({
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
      totalModules: modules ? modules.length : 0,
    });

    await course.save();

    res.status(201).json({ success: true, message: "Course created", course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCourses = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

const getCourse = async (req, res) => {}

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await courseModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course updated", course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await courseModel.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addCourse, getAllCourses, getCourse, updateCourse, deleteCourse };
