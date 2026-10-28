import express from "express";
import {
  placeOrder,
  getUserOrders,
  updateOrderStatus,
  getSellerOrders,
  uploadPaymentProof,
  getAllOrders,
} from "../controllers/orderController.js";

import authorize, { ownOrAdmin } from "../middleware/authorize.js";

const orderRouter = express.Router();
const admins = ["superadmin", "admin", "support"];

orderRouter.post("/place", authorize("user"), placeOrder);
orderRouter.get("/all", authorize(...admins), getAllOrders);
orderRouter.post("/all", authorize(...admins), getAllOrders);
orderRouter.post("/user-orders", authorize("user"), getUserOrders);
orderRouter.get("/user-orders", authorize("user"), getUserOrders);
orderRouter.post("/seller-orders", authorize("seller"), getSellerOrders);
orderRouter.get("/seller-orders", authorize("seller"), getSellerOrders);
orderRouter.post("/upload-proof", authorize("user"), uploadPaymentProof);
orderRouter.post("/update-status", authorize(...admins, "seller"), updateOrderStatus);

export default orderRouter;
