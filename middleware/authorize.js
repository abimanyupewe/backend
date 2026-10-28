import jwt from "jsonwebtoken";

export const ADMIN_ROLES = ["superadmin", "admin"];

// Verifikasi JWT dan batasi akses berdasarkan role di token.
// Admin dari .env (superadmin) tidak punya id; admin DB punya id + role.
const authorize =
  (...roles) =>
  (req, res, next) => {
    const header = req.headers.authorization;
    const raw =
      req.headers.token ||
      (header?.startsWith("Bearer ") ? header.split(" ")[1] : header);
    if (!raw) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    try {
      const { id, role, email } = jwt.verify(raw, process.env.JWT_SECRET);
      if (!roles.includes(role)) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      req.auth = { id: id && String(id), role, email };
      // Identitas dari token menimpa nilai kiriman klien.
      if (role === "user") req.body = { ...req.body, userId: (req.userId = req.auth.id) };
      if (role === "seller") req.body = { ...req.body, sellerId: (req.sellerId = req.auth.id) };
      next();
    } catch {
      res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  };

// Untuk route yang membawa id target: non-admin hanya boleh menyentuh id miliknya.
export const ownOrAdmin = (req, res, next) => {
  if (ADMIN_ROLES.includes(req.auth.role)) return next();
  const target = req.params.id || req.body?.id || req.body?.userId || req.body?._id;
  if (!target || String(target) !== req.auth.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
};

export default authorize;
