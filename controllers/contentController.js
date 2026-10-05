import contentModel from "../models/contentModel.js";
import blogModel from "../models/blogModel.js";
import teamModel from "../models/teamModel.js";
import documentationModel from "../models/documentationModel.js";

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


export const getBlogs = async (req, res) => {
  try {
    const blogs = await blogModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await teamModel.find({});
    res.json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentations = async (req, res) => {
  try {
    const documentations = await documentationModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, documentations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import mongoose from "mongoose";

export const addBlogComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, comment, image } = req.body;
    
    // Find blog by id or slug safely
    const query = mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
    const blog = await blogModel.findOne(query);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    
    blog.comments.push({ name, comment, image });
    await blog.save();
    
    res.json({ success: true, message: "Comment added", comments: blog.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addBlogHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
    const blog = await blogModel.findOne(query);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    
    blog.helpfulCount = (blog.helpfulCount || 0) + 1;
    await blog.save();
    
    res.json({ success: true, message: "Helpful counted", helpfulCount: blog.helpfulCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addBlogCommentLike = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const query = mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
    const blog = await blogModel.findOne(query);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    
    const comment = blog.comments.id(commentId);
    if (!comment) {
      // Sometimes UI sends a timestamp ID before it's saved correctly as ObjectId.
      // So we fallback to finding by name/date if needed, but here we can just find by id.
      const commentByIndex = blog.comments.find(c => c._id.toString() === commentId.toString() || c.id === Number(commentId));
      if (!commentByIndex) {
        return res.status(404).json({ success: false, message: "Comment not found" });
      }
      commentByIndex.likes = (commentByIndex.likes || 0) + 1;
    } else {
      comment.likes = (comment.likes || 0) + 1;
    }
    
    await blog.save();
    res.json({ success: true, message: "Comment liked" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
