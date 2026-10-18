import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";

const adminAuth = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization: Bearer <token> atau header token
    const rawToken =
      req.headers.token ||
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization);

    if (!rawToken) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized" });
    }

    // Verifikasi token
    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);

    // Cek admin di database (kecuali superadmin dari .env)
    if (decoded.role === "superadmin") {
      // Superadmin dari .env, tidak perlu cek database
      req.admin = { email: decoded.email, role: "superadmin" };
      return next();
    }

    // Untuk admin lain, cek database
    const admin = await adminModel.findById(decoded.id);
    if (!admin || admin.status !== "active") {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized" });
    }
    req.admin = admin;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminAuth;
