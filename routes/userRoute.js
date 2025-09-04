import express from "express";
import { deleteUser, loginUser, registerUser, updateUser, verOTP } from "../controllers/userController.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/update", upload.fields([{ name: "profileImage", maxCount: 1 }]), updateUser);
userRouter.post("/delete", deleteUser);
userRouter.post("/verify-otp", verOTP);

export default userRouter;
