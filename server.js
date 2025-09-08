import express from "express";
import connectDB from "./config/mongodb.js";
import cors from "cors";
import "dotenv/config.js"; // Load environment variables
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import adminRouter from "./routes/adminRoute.js";

import userModel from "./models/userModels.js";
import sellerModel from "./models/sellerModel.js";
import sellerRouter from "./routes/sellerRoute.js";

setInterval(async () => {
  await userModel.deleteMany({
    isVerifed: false,
    otpExpired: { $lt: new Date() },
  });
  await sellerModel.deleteMany({
    isVerifed: false,
    otpExpired: { $lt: new Date() },
  });
}, 60 * 1000); // 1 menit

// app config
const app = express();
const port = process.env.PORT || 4000; // port setting

// middleware
app.use(express.json()); // parse JSON
app.use(cors());

connectDB(); // connect to MongoDB
connectCloudinary(); // connect to cloudinary

// end point API
// role
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
// product
app.use("/api/product", productRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Florera API!");
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
