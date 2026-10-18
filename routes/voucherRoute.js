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

const router = express.Router();

// Global Voucher Routes
router.get("/global", getGlobalVouchers);
router.post("/global", createGlobalVoucher);
router.delete("/global/:id", deleteGlobalVoucher);
router.get("/all", getGlobalVouchers);

// Voucher Validation Route
router.post("/validate", validateVoucher);

// Creator & Specific Routes
router.post("/create", createVoucher);
router.get("/creator/:creatorId", getVouchersByCreator);
router.delete("/delete/:id", deleteVoucher);

export default router;
