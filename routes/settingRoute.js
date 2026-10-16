import express from "express";
import { getSettings, updateSettings } from "../controllers/settingController.js";
import adminAuth from "../middleware/adminAuth.js";

const settingRouter = express.Router();

settingRouter.get("/", getSettings);
settingRouter.put("/update", adminAuth, updateSettings);

export default settingRouter;
