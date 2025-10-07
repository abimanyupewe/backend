import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";
import { sendOTPCode } from "../middleware/Email.js";
import adminModel from "../models/adminModel.js";
import userModel from "../models/userModels.js";
import sellerModel from "../models/sellerModel.js";
import mentorModel from "../models/mentorModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Login superadmin (pakai .env)
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email, role: "superadmin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ success: true, role: "superadmin", token });
    }

    // Login admin biasa (pakai database)
    const admin = await adminModel.findOne({ email, status: "active" });
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role || "admin",
        email: admin.email,
        name: admin.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ success: true, role: admin.role || "admin", token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const inviteAdmin = async (req, res) => {
  try {
    const { email, role } = req.body;
    // Validasi role
    const allowedRoles = ["admin", "support", "contentmanager"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    // Cek email sudah ada
    const existing = await adminModel.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already invited/registered" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpired = Date.now() + 1 * 60 * 1000; // 1 menit

    // Simpan ke database
    await adminModel.create({
      email,
      role,
      otp,
      otpExpired,
      status: "pending",
    });

    // Kirim OTP ke email (implementasikan sendEmail sesuai kebutuhan)
    sendOTPCode(email, otp);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerInvitedAdmin = async (req, res) => {
  try {
    const { otp, name, password } = req.body;

    // Cari admin berdasarkan OTP dan status pending
    const admin = await adminModel.findOne({ otp, status: "pending" });

    if (!admin)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (admin.otpExpired < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update admin data
    admin.name = name;
    admin.password = hashedPassword;
    admin.status = "active";
    admin.otp = undefined;
    admin.otpExpired = undefined;
    await admin.save();

    res.json({ success: true, message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Disable admin (set status nonaktif)
const disableAdmin = async (req, res) => {
  try {
    const { adminId } = req.body;
    if (!adminId)
      return res
        .status(400)
        .json({ success: false, message: "adminId is required" });

    const admin = await adminModel.findById(adminId);
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    if (admin.role === "superadmin")
      return res
        .status(403)
        .json({ success: false, message: "Cannot disable superadmin" });

    admin.status = "disabled";
    await admin.save();

    res.json({ success: true, message: "Admin disabled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.body;
    if (!adminId)
      return res
        .status(400)
        .json({ success: false, message: "adminId is required" });

    const admin = await adminModel.findById(adminId);
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    if (admin.role === "superadmin")
      return res
        .status(403)
        .json({ success: false, message: "Cannot delete superadmin" });

    await adminModel.findByIdAndDelete(adminId);

    res.json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await adminModel.findById(adminId);
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCountsUserSellerMentor = async (req, res) => {
  try {
    const [userCount, sellerCount, mentorCount] = await Promise.all([
      userModel.countDocuments(),
      sellerModel.countDocuments(),
      mentorModel.countDocuments(),
    ]);
    res.json({
      success: true,
      data: {
        totalUser: userCount,
        totalSeller: sellerCount,
        totalMentor: mentorCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGrowthRateUserSellerMentor = async (req, res) => {
  try {
    // Periode: 7 hari terakhir
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    const prevWeekStart = new Date(lastWeek);
    prevWeekStart.setDate(lastWeek.getDate() - 7);

    // Jumlah user/seller/mentor minggu ini
    const userThisWeek = await userModel.countDocuments({ createdAt: { $gte: lastWeek, $lte: now } });
    const sellerThisWeek = await sellerModel.countDocuments({ createdAt: { $gte: lastWeek, $lte: now } });
    const mentorThisWeek = await mentorModel.countDocuments({ createdAt: { $gte: lastWeek, $lte: now } });

    // Jumlah user/seller/mentor minggu lalu
    const userLastWeek = await userModel.countDocuments({ createdAt: { $gte: prevWeekStart, $lt: lastWeek } });
    const sellerLastWeek = await sellerModel.countDocuments({ createdAt: { $gte: prevWeekStart, $lt: lastWeek } });
    const mentorLastWeek = await mentorModel.countDocuments({ createdAt: { $gte: prevWeekStart, $lt: lastWeek } });

    // Hitung growth rate (jika minggu lalu 0, growth dianggap 100% jika ada penambahan)
    const calcGrowth = (nowCount, prevCount) => {
      if (prevCount === 0) return nowCount > 0 ? 100 : 0;
      return ((nowCount - prevCount) / prevCount) * 100;
    };

    res.json({
      success: true,
      data: {
        growthRateUser: calcGrowth(userThisWeek, userLastWeek),
        growthRateSeller: calcGrowth(sellerThisWeek, sellerLastWeek),
        growthRateMentor: calcGrowth(mentorThisWeek, mentorLastWeek),
        userThisWeek,
        userLastWeek,
        sellerThisWeek,
        sellerLastWeek,
        mentorThisWeek,
        mentorLastWeek,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  adminLogin,
  inviteAdmin,
  registerInvitedAdmin,
  disableAdmin,
  deleteAdmin,
  getAdmin,
  getCountsUserSellerMentor,
  getGrowthRateUserSellerMentor,
};
