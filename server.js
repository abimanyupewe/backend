import express from "express";
import connectDB from "./config/mongodb.js";
import cors from "cors";
import "dotenv/config.js"; // Load environment variables
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import adminRouter from "./routes/adminRoute.js";
import courseRouter from "./routes/courseRoute.js";
import mentorRouter from "./routes/mentorRoute.js";

import userModel from "./models/userModels.js";
import sellerModel from "./models/sellerModel.js";
import sellerRouter from "./routes/sellerRoute.js";
import adminModel from "./models/adminModel.js";
import mentorModel from "./models/mentorModel.js";
import categoryRouter from "./routes/categoryRoute.js";
import midtransRouter from "./routes/midtransRoute.js";
import cartRouter from "./routes/cartRoute.js";

setInterval(async () => {
  await userModel.deleteMany({
    isVerifed: false,
    otpExpired: { $lt: new Date() },
  });
  await sellerModel.deleteMany({
    isVerifed: false,
    otpExpired: { $lt: new Date() },
  });
  await mentorModel.deleteMany({
    isVerifed: false,
    otpExpired: { $lt: new Date() },
  });
  await adminModel.deleteMany({
    isVerifed: false,
    status: "pending",
    otpExpired: { $lt: new Date() },
  });
}, 60 * 1000); // 1 menit

// Allowed origins
const allowedOrigins = [
  "http://localhost:3000", // development
  "http://localhost:3001", // jika ada development lain
  process.env.FRONTEND_FLORERA?.replace(/\/$/, ''), // https://florera-app.vercel.app
  process.env.FRONTEND_ADMIN_SELLER?.replace(/\/$/, ''), // https://florera-admin-seller.vercel.app
  process.env.FRONTEND_ADMIN_MENTOR?.replace(/\/$/, ''), // https://florera-admin-mentor.vercel.app
];

// app config
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

connectDB(); // connect to MongoDB
connectCloudinary(); // connect to cloudinary

// end point API
// role
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/mentor", mentorRouter);
// product
app.use("/api/product", productRouter);
// course
app.use("/api/course", courseRouter);
// category
app.use("/api/category", categoryRouter);
// cart
app.use("/api/cart", cartRouter);

// payment
app.use("/api/payment/midtrans", midtransRouter);

app.get("/", (req, res) => {
  res.json("Welcome to Florera API!");
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
