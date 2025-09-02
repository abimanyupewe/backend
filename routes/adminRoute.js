import express from "express";
import { adminLogin } from "../controllers/adminController.js";

const adminRouter = express.Router();

// route for admin login
adminRouter.post("/login", adminLogin);

export default adminRouter;
