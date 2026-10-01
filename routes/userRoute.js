import express from "express";
import { deleteUser, loginUser, registerUser, updateUser, verOTP, getUserProfile } from "../controllers/userController.js";
import upload from "../middleware/multer.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authUser, getUserProfile);
userRouter.put("/update", upload.fields([{ name: "profileImage", maxCount: 1 }]), updateUser);
userRouter.delete("/delete", deleteUser);
userRouter.post("/verify-otp", verOTP);

export default userRouter;
