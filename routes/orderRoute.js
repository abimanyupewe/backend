import express from "express";
import {
  placeOrder,
  getUserOrders,
  updateOrderStatus,
  getSellerOrders,
  uploadPaymentProof,
  getAllOrders,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", placeOrder);
orderRouter.get("/all", getAllOrders);
orderRouter.post("/all", getAllOrders);
orderRouter.post("/user-orders", getUserOrders);
orderRouter.get("/user-orders", getUserOrders);
orderRouter.post("/seller-orders", getSellerOrders);
orderRouter.get("/seller-orders", getSellerOrders);
orderRouter.post("/upload-proof", uploadPaymentProof);
orderRouter.post("/update-status", updateOrderStatus);

export default orderRouter;
