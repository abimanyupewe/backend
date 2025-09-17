const roleAuth = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.admin || req.user; // tergantung implementasi
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};

export default roleAuth;
