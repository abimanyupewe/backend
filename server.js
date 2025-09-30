// import express from "express";
// import connectDB from "./config/mongodb.js";
// import cors from "cors";
// import "dotenv/config.js"; // Load environment variables
// import connectCloudinary from "./config/cloudinary.js";
// import userRouter from "./routes/userRoute.js";
// import productRouter from "./routes/productRoute.js";
// import adminRouter from "./routes/adminRoute.js";
// import courseRouter from "./routes/courseRoute.js";
// import mentorRouter from "./routes/mentorRoute.js";
// import userModel from "./models/userModels.js";
// import sellerModel from "./models/sellerModel.js";
// import sellerRouter from "./routes/sellerRoute.js";
// import adminModel from "./models/adminModel.js";
// import mentorModel from "./models/mentorModel.js";
// import categoryRouter from "./routes/categoryRoute.js";
// import midtransRouter from "./routes/midtransRoute.js";
// import cartRouter from "./routes/cartRoute.js";

// // app config
// const app = express();
// const port = process.env.PORT || 4000;

// // Auto cleanup expired OTP - PINDAH KE SINI
// setInterval(async () => {
//   await userModel.deleteMany({
//     isVerifed: false,
//     otpExpired: { $lt: new Date() },
//   });
//   await sellerModel.deleteMany({
//     isVerifed: false,
//     otpExpired: { $lt: new Date() },
//   });
//   await mentorModel.deleteMany({
//     isVerifed: false,
//     otpExpired: { $lt: new Date() },
//   });
//   await adminModel.deleteMany({
//     isVerifed: false,
//     status: "pending",
//     otpExpired: { $lt: new Date() },
//   });
// }, 60 * 1000); // 1 menit

// // Allowed origins
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   process.env.FRONTEND_FLORERA?.replace(/\/$/, ""),
//   process.env.FRONTEND_ADMIN_SELLER?.replace(/\/$/, ""),
//   process.env.FRONTEND_ADMIN_MENTOR?.replace(/\/$/, ""),
// ];

// // middleware
// app.use(express.json());
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error(`Not allowed by CORS: ${origin}`));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// connectDB(); // connect to MongoDB
// connectCloudinary(); // connect to cloudinary

// // API routes
// app.use("/api/admin", adminRouter);
// app.use("/api/user", userRouter);
// app.use("/api/seller", sellerRouter);
// app.use("/api/mentor", mentorRouter);
// app.use("/api/product", productRouter);
// app.use("/api/course", courseRouter);
// app.use("/api/category", categoryRouter);
// app.use("/api/cart", cartRouter);
// app.use("/api/payment/midtrans", midtransRouter);

// app.get("/", (req, res) => {
//   res.json("Welcome to Florera API!");
// });

// app.listen(port, () => console.log(`Server is running on port ${port}`));

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

// app config
const app = express();
const port = process.env.PORT || 4000;

// middleware - PINDAHKAN KE ATAS SEBELUM ROUTES
app.use(express.json({ limit: "10mb" }));

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://florera-app.vercel.app", // TANPA trailing slash
      // Tambah URL frontend lainnya di sini
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to databases
connectDB();
connectCloudinary();

// Auto cleanup expired OTP (pindah setelah DB connection)
setInterval(async () => {
  try {
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
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}, 60 * 1000); // 1 menit

// API routes
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/mentor", mentorRouter);
app.use("/api/product", productRouter);
app.use("/api/course", courseRouter);
app.use("/api/category", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payment/midtrans", midtransRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Florera API!",
    status: "Server is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      admin: "/api/admin",
      user: "/api/user",
      seller: "/api/seller",
      mentor: "/api/mentor",
      product: "/api/product",
      course: "/api/course",
      category: "/api/category",
      cart: "/api/cart",
      payment: "/api/payment/midtrans",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("Environment:", process.env.NODE_ENV || "development");
});

// Export for Vercel
export default app;
