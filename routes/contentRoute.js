import express from "express";
import { getHomepageContent, updateHomepageContent, getBlogs, getTeams, getDocumentations, addBlogComment, addBlogHelpful, addBlogCommentLike } from "../controllers/contentController.js";

import authorize, { ownOrAdmin } from "../middleware/authorize.js";

const contentRouter = express.Router();

// Public route to get content
contentRouter.get("/homepage", getHomepageContent);

contentRouter.put("/homepage", authorize("superadmin", "admin", "contentmanager"), updateHomepageContent);

contentRouter.get("/blogs", getBlogs);
contentRouter.post("/blogs/:id/comment", addBlogComment);
contentRouter.post("/blogs/:id/comment/:commentId/like", addBlogCommentLike);
contentRouter.post("/blogs/:id/helpful", addBlogHelpful);

contentRouter.get("/teams", getTeams);
contentRouter.get("/documentations", getDocumentations);

export default contentRouter;
