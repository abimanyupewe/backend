import express from "express";
import {
  createVoucher,
  getVouchersByCreator,
  deleteVoucher
} from "../controllers/voucherController.js";

const router = express.Router();

router.post("/create", createVoucher);
router.get("/creator/:creatorId", getVouchersByCreator);
router.delete("/delete/:id", deleteVoucher);

export default router;
