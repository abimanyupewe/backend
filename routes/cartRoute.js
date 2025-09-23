import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  updateCartItem,
} from "../controllers/cartController.js";
import authUser from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.get("/get", authUser, getCart);
cartRouter.post("/add", authUser, addToCart);
cartRouter.put("/update", authUser, updateCartItem);
cartRouter.delete("/remove", authUser, removeFromCart);
cartRouter.delete("/clear", authUser, clearCart);

export default cartRouter;
