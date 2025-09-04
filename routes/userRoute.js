import express from "express";
import { loginUser, registerUser, updateUser } from "../controllers/userController.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/update", upload.fields([{ name: "profileImage", maxCount: 1 }]), updateUser);

export default userRouter;
