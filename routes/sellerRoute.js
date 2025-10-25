import express from "express";
import {
  registerSeller,
  listSellers,
  updateSeller,
  removeSeller,
  singleSeller,
  verifySellerOTP,
  loginSeller,
  getAllProducts,
  getSingleProduct,
  deleteSingleProduct,
  updateSingleProduct,
  disableProduct,
  enableProduct,
} from "../controllers/sellerController.js";
import upload from "../middleware/multer.js";
import sellerAuth from "../middleware/sellerAuth.js";

const sellerRouter = express.Router();

sellerRouter.post("/login", loginSeller);
sellerRouter.post("/register", registerSeller);
sellerRouter.get("/list", listSellers);
sellerRouter.put(
  "/update",
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  updateSeller
);
sellerRouter.delete("/remove", removeSeller);
sellerRouter.get("/single", singleSeller);
sellerRouter.post("/verify-otp", verifySellerOTP);
sellerRouter.get("/all-products-seller", sellerAuth, getAllProducts);
sellerRouter.get("/single-product", sellerAuth, getSingleProduct);
sellerRouter.delete("/delete-product", sellerAuth, deleteSingleProduct);
sellerRouter.put(
  "/update-product",
  sellerAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateSingleProduct
);
sellerRouter.put("/disable-product", sellerAuth, disableProduct);
sellerRouter.put("/enable-product", sellerAuth, enableProduct);

export default sellerRouter;
