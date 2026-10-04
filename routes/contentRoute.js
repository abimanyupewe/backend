import express from "express";
import { getHomepageContent, updateHomepageContent } from "../controllers/contentController.js";

const contentRouter = express.Router();

// Public route to get content
contentRouter.get("/homepage", getHomepageContent);

// Admin route to update content (In a real app, add auth middleware here)
contentRouter.put("/homepage", updateHomepageContent);

export default contentRouter;
