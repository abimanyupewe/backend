import express from "express";
import { deleteUser, loginUser, registerUser, updateUser, verOTP, forgotPassword, resetPassword, getUserProfile, changePassword } from "../controllers/userController.js";
import upload from "../middleware/multer.js";
import authUser from "../middleware/auth.js";
import authorize, { ownOrAdmin } from "../middleware/authorize.js";

const userRouter = express.Router();
const anyone = ["superadmin", "admin", "user", "seller", "mentor"];

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authUser, getUserProfile);
userRouter.put("/update", authorize(...anyone), ownOrAdmin, upload.fields([{ name: "profileImage", maxCount: 1 }]), updateUser);
userRouter.post("/change-password", changePassword);
userRouter.delete("/delete", authorize(...anyone), ownOrAdmin, deleteUser);
userRouter.post("/verify-otp", verOTP);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/profile", authUser, getUserProfile);

export default userRouter;
