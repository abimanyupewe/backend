import express from "express";
import {
  placeOrder,
  getUserOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", placeOrder);
orderRouter.post("/user-orders", getUserOrders);
orderRouter.get("/user-orders", getUserOrders);
orderRouter.post("/update-status", updateOrderStatus);

export default orderRouter;
