import express from "express";
import {
  adminLogin,
  inviteAdmin,
  registerInvitedAdmin,
  disableAdmin,
  deleteAdmin,
  getAdmin,
} from "../controllers/adminController.js";
import superAdminAuth from "../middleware/superAdmin.js";
import adminAuth from "../middleware/adminAuth.js";
import roleAuth from "../middleware/roleAuth.js";

const adminRouter = express.Router();

// route for admin
adminRouter.post("/login", adminLogin);
adminRouter.post("/invite", adminAuth, roleAuth("superadmin"), inviteAdmin);
adminRouter.post("/register", registerInvitedAdmin);
adminRouter.post("/disable", adminAuth, roleAuth("superadmin"), disableAdmin);
adminRouter.delete("/delete", adminAuth, roleAuth("superadmin"), deleteAdmin);
adminRouter.get("/get/:adminId", adminAuth, roleAuth("superadmin"), getAdmin);

export default adminRouter;
