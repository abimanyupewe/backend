import contentModel from "../models/contentModel.js";

// @route   GET /api/content/homepage
// @desc    Get homepage content (public)
// @access  Public
export const getHomepageContent = async (req, res) => {
  try {
    const content = await contentModel.findOne({ type: "homepage" });
    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }
    res.json({ success: true, data: content });
  } catch (error) {
    console.error("Error getting homepage content:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/content/homepage
// @desc    Update homepage content (admin)
// @access  Private (Admin)
export const updateHomepageContent = async (req, res) => {
  try {
    const { topBanner, heroSliders, faqs } = req.body;
    
    // Find and update, or create if it doesn't exist
    const content = await contentModel.findOneAndUpdate(
      { type: "homepage" },
      { 
        $set: { 
          topBanner, 
          heroSliders, 
          faqs 
        } 
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: content, message: "Homepage content updated successfully" });
  } catch (error) {
    console.error("Error updating homepage content:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
