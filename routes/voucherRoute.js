import express from "express";
import {
  createVoucher,
  createGlobalVoucher,
  getGlobalVouchers,
  getVouchersByCreator,
  deleteVoucher,
  deleteGlobalVoucher,
  validateVoucher,
} from "../controllers/voucherController.js";

import authorize, { ownOrAdmin } from "../middleware/authorize.js";

const router = express.Router();
const admins = ["superadmin", "admin"];
const creators = [...admins, "seller", "mentor"];

// Global Voucher Routes
router.get("/global", getGlobalVouchers);
router.post("/global", authorize(...admins), createGlobalVoucher);
router.delete("/global/:id", authorize(...admins), deleteGlobalVoucher);
router.get("/all", getGlobalVouchers);

// Voucher Validation Route
router.post("/validate", validateVoucher);

// Creator & Specific Routes
router.post("/create", authorize(...creators), createVoucher);
router.get("/creator/:creatorId", authorize(...creators), getVouchersByCreator);
router.delete("/delete/:id", authorize(...creators), deleteVoucher);

export default router;
