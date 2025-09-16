import express from "express";
import {
  listProducts,
  addProduct,
  updateProduct,
  removeProduct,
  singleProduct,
  getProductsSeller,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import sellerAuth from "../middleware/sellerAuth.js";

const productRouter = express.Router();

// route for product
productRouter.post(
  "/add",
  adminAuth, sellerAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);
productRouter.put(
  "/update",
  adminAuth, sellerAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateProduct
);
productRouter.delete("/remove", adminAuth, sellerAuth, removeProduct);
productRouter.get("/list", listProducts);
productRouter.get("/single", singleProduct);
productRouter.get("/seller/:seller", getProductsSeller);

export default productRouter;
