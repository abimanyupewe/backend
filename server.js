import express from "express";
import connectDB from "./config/mongodb.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config.js"; // Load environment variables
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import adminRouter from "./routes/adminRoute.js";
import courseRouter from "./routes/courseRoute.js";
import mentorRouter from "./routes/mentorRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import cartRouter from "./routes/cartRoute.js";
import agencyRouter from "./routes/agencyRoute.js";
import orderRouter from "./routes/orderRoute.js";
import voucherRouter from "./routes/voucherRoute.js";
import contentRouter from "./routes/contentRoute.js";
import midtransRouter from "./routes/midtransRoute.js";
import settingRouter from "./routes/settingRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// Allowed origins dari environment variables
const allowedOrigins = [
  "http://localhost:3000", // development
  "http://localhost:3001", // development backup
  "http://localhost:3002",
  "http://localhost:3003",
  process.env.FRONTEND_FLORERA?.replace(/\/$/, ""), // Main app
  process.env.FRONTEND_ADMIN_SELLER?.replace(/\/$/, ""), // Admin Seller
  process.env.FRONTEND_ADMIN_MENTOR?.replace(/\/$/, ""), // Admin Mentor
  process.env.FRONTEND_FLORERA_ADMIN?.replace(/\/$/, ""), // Admin All in One
].filter(Boolean); // Remove undefined values

// middleware
app.set("trust proxy", 1); // di belakang proxy (Vercel) agar IP klien benar
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests dengan no origin (mobile apps, Postman, curl, dll.)
      if (!origin) return callback(null, true);

      // Development mode - lebih permisif
      if (process.env.NODE_ENV !== "production") {
        // Allow semua localhost untuk development
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
          return callback(null, true);
        }
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`❌ CORS blocked: ${origin}`);
        console.log(`✅ Allowed origins:`, allowedOrigins);
        // Jangan throw error, return false saja
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-requested-with",
      "Access-Control-Allow-Origin",
      "Accept",
      "X-Requested-With",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200, // Legacy browser support
  })
);

connectDB();
connectCloudinary();

// Batasi percobaan login/OTP/reset per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak percobaan, coba lagi nanti." },
});
for (const role of ["user", "seller", "mentor"]) {
  app.use(`/api/${role}/login`, authLimiter);
  app.use(`/api/${role}/register`, authLimiter);
  app.use(`/api/${role}/verify-otp`, authLimiter);
  app.use(`/api/${role}/forgot-password`, authLimiter);
  app.use(`/api/${role}/reset-password`, authLimiter);
}
for (const path of ["login", "register", "forgot-password", "reset-password"]) {
  app.use(`/api/admin/${path}`, authLimiter);
}
app.use("/api/user/change-password", authLimiter);

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
app.use("/api/agency", agencyRouter);
app.use("/api/order", orderRouter);
app.use("/api/voucher", voucherRouter);
app.use("/api/content", contentRouter);
app.use("/api/setting", settingRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Florera API!",
    status: "running",
    timestamp: new Date().toISOString(),
    allowedOrigins:
      process.env.NODE_ENV !== "production" ? allowedOrigins : undefined,
    endpoints: {
      mainApp: process.env.FRONTEND_FLORERA,
      adminSeller: process.env.FRONTEND_ADMIN_SELLER,
      adminMentor: process.env.FRONTEND_ADMIN_MENTOR,
      adminFlorera: process.env.FRONTEND_FLORERA_ADMIN,
    },
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Connected frontends:`);
  console.log(`   - Main App: ${process.env.FRONTEND_FLORERA}`);
  console.log(`   - Admin Seller: ${process.env.FRONTEND_ADMIN_SELLER}`);
  console.log(`   - Admin Mentor: ${process.env.FRONTEND_ADMIN_MENTOR}`);
  console.log(`   - Admin Florera: ${process.env.FRONTEND_FLORERA_ADMIN}`);
});

export default app;
