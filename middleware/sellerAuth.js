import jwt from "jsonwebtoken";

const sellerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.token;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Not Authorized - No token provided" });
    }
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized - Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.sellerId = decoded.id;
    next();
  } catch (error) {
    console.error("Error saat melakukan autentikasi seller:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default sellerAuth;
