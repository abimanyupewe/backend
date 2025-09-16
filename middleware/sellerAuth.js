import jwt from "jsonwebtoken";

const sellerAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "Not Authorized again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.seller = decoded.id;
    next();
  } catch (error) {
    console.error("Error saat melakukan autentikasi seller:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default sellerAuth;
