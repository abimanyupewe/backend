import express from "express";
import { placeOrder, userOrders, updateStatus } from "../controllers/orderController.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/user-orders", authUser, userOrders);
orderRouter.post("/update-status", authUser, updateStatus);

export default orderRouter;
