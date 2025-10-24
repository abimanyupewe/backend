import jwt from "jsonwebtoken";

const sellerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ success: false, message: "Not Authorized" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.json({ success: false, message: "Not Authorized again" });
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
