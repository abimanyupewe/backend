import jwt from "jsonwebtoken";

// route for admin login
const adminLogin = async (req, res) => {
  // membuat email dan password untuk user yang nanti akan berupa token
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Creadentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// token yang dihasilkan admin, untuk credential saat mau add, remove, update product. jika ingin melakukan testing tambahkan header Authorization dengan nama <token>

export { adminLogin };