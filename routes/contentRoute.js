import express from "express";
import { getHomepageContent, updateHomepageContent, getBlogs, getTeams, getDocumentations, addBlogComment, addBlogHelpful, addBlogCommentLike } from "../controllers/contentController.js";

const contentRouter = express.Router();

// Public route to get content
contentRouter.get("/homepage", getHomepageContent);

// Admin route to update content (In a real app, add auth middleware here)
contentRouter.put("/homepage", updateHomepageContent);

contentRouter.get("/blogs", getBlogs);
contentRouter.post("/blogs/:id/comment", addBlogComment);
contentRouter.post("/blogs/:id/comment/:commentId/like", addBlogCommentLike);
contentRouter.post("/blogs/:id/helpful", addBlogHelpful);

contentRouter.get("/teams", getTeams);
contentRouter.get("/documentations", getDocumentations);

export default contentRouter;
