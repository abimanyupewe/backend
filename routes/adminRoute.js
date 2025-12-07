import express from "express";
import {
  adminLogin,
  inviteAdmin,
  registerInvitedAdmin,
  disableAdmin,
  deleteAdmin,
  getAdmin,
  getCountsUserSellerMentor,
  getGrowthRateUserSellerMentor,
  getDailyCountsUserSellerMentor,
  getAllUserSellerMentor,
  getAllAdmin,
  activedAdmin,
  getAllUser,
  getAllSeller,
  getAllMentor,
  forgotPassword,
  resetPassword,
} from "../controllers/adminController.js";
import superAdminAuth from "../middleware/superAdmin.js";
import adminAuth from "../middleware/adminAuth.js";
import roleAuth from "../middleware/roleAuth.js";

const adminRouter = express.Router();

// route for admin
adminRouter.post("/login", adminLogin);
adminRouter.post("/forgot-password", forgotPassword);
adminRouter.post("/reset-password", resetPassword);
adminRouter.post("/invite", adminAuth, roleAuth("superadmin"), inviteAdmin);
adminRouter.post("/register", registerInvitedAdmin);
adminRouter.post("/disable", adminAuth, roleAuth("superadmin"), disableAdmin);
adminRouter.delete("/delete", adminAuth, roleAuth("superadmin"), deleteAdmin);
adminRouter.get("/get/:adminId", adminAuth, roleAuth("superadmin"), getAdmin);
adminRouter.get("/summary", superAdminAuth, getCountsUserSellerMentor);
adminRouter.get("/growth-rate", superAdminAuth, getGrowthRateUserSellerMentor);
adminRouter.get(
  "/all-user-seller-mentor",
  superAdminAuth,
  roleAuth("superadmin"),
  getAllUserSellerMentor
);
adminRouter.get(
  "/daily-counts",
  superAdminAuth,
  getDailyCountsUserSellerMentor
);
adminRouter.get("/all-admin", adminAuth, roleAuth("superadmin"), getAllAdmin);
adminRouter.post("/actived", adminAuth, roleAuth("superadmin"), activedAdmin);
adminRouter.get(
  "/all-user",
  superAdminAuth,
  roleAuth("superadmin"),
  getAllUser
);
adminRouter.get(
  "/all-seller",
  superAdminAuth,
  roleAuth("superadmin"),
  getAllSeller
);
adminRouter.get(
  "/all-mentor",
  superAdminAuth,
  roleAuth("superadmin"),
  getAllMentor
);

export default adminRouter;
