import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";
// import { sendOTPCode } from "../middleware/Email.js";
import { sendOTPCode, sendResetPasswordEmail } from "../middleware/SendGrid.js";
import adminModel from "../models/adminModel.js";
import userModel from "../models/userModels.js";
import sellerModel from "../models/sellerModel.js";
import mentorModel from "../models/mentorModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
      isVerifed: false,
      otpExpired,
      status: "pending",
    });

    // Kirim OTP ke email (implementasikan sendEmail sesuai kebutuhan)
    // sendOTPCode(email, otp); ini menggunakan nodemailer
    sendOTPCode(email, otp); // ini menggunakan sendgrid

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerInvitedAdmin = async (req, res) => {
  try {
    const { otp, name, password } = req.body;

    // Validasi minimal 8 karakter
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

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
    (admin.isVerifed = true), (admin.status = "active");
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

const activedAdmin = async (req, res) => {
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

    if (admin.status !== "disabled")
      return res
        .status(400)
        .json({ success: false, message: "Admin is not disabled" });

    admin.status = "active";
    await admin.save();

    res.json({ success: true, message: "Admin activated successfully" });
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

const getAllAdmin = async (req, res) => {
  try {
    const admins = await adminModel.find({ role: { $ne: "superadmin" } });
    res.json({ success: true, data: admins });
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
    const userThisWeek = await userModel.countDocuments({
      createdAt: { $gte: lastWeek, $lte: now },
    });
    const sellerThisWeek = await sellerModel.countDocuments({
      createdAt: { $gte: lastWeek, $lte: now },
    });
    const mentorThisWeek = await mentorModel.countDocuments({
      createdAt: { $gte: lastWeek, $lte: now },
    });

    // Jumlah user/seller/mentor minggu lalu
    const userLastWeek = await userModel.countDocuments({
      createdAt: { $gte: prevWeekStart, $lt: lastWeek },
    });
    const sellerLastWeek = await sellerModel.countDocuments({
      createdAt: { $gte: prevWeekStart, $lt: lastWeek },
    });
    const mentorLastWeek = await mentorModel.countDocuments({
      createdAt: { $gte: prevWeekStart, $lt: lastWeek },
    });

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

// Helper untuk generate array tanggal
function getLastNDays(n) {
  const days = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10)); // format: YYYY-MM-DD
  }
  return days;
}

const getDailyCountsUserSellerMentor = async (req, res) => {
  try {
    // Ambil period dari query, default 7 (minggu)
    const { period } = req.query;
    let daysCount = 7;
    if (period === "day") daysCount = 1;
    else if (period === "week") daysCount = 7;
    else if (period === "month") daysCount = 30;

    const days = getLastNDays(daysCount);

    // Fungsi agregasi untuk model
    const getDailyCounts = async (model) => {
      const result = await model.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(days[0] + "T00:00:00.000Z"),
              $lte: new Date(days[days.length - 1] + "T23:59:59.999Z"),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]);
      // Mapping hasil ke array sesuai urutan hari
      const map = {};
      result.forEach((r) => (map[r._id] = r.count));
      return days.map((d) => map[d] || 0);
    };

    const [userDaily, sellerDaily, mentorDaily] = await Promise.all([
      getDailyCounts(userModel),
      getDailyCounts(sellerModel),
      getDailyCounts(mentorModel),
    ]);

    res.json({
      success: true,
      period: period || "week",
      days,
      userDaily,
      sellerDaily,
      mentorDaily,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUserSellerMentor = async (req, res) => {
  try {
    const [users, sellers, mentors] = await Promise.all([
      userModel.find(),
      sellerModel.find(),
      mentorModel.find(),
    ]);
    res.json({
      success: true,
      users,
      sellers,
      mentors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await userModel.find();
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllSeller = async (req, res) => {
  try {
    const sellers = await sellerModel.find();
    res.json({
      success: true,
      sellers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllMentor = async (req, res) => {
  try {
    const mentors = await mentorModel.find();
    res.json({
      success: true,
      mentors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Email not registered" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpired = Date.now() + 5 * 60 * 1000; // 5 menit

    admin.otp = otp;
    admin.otpExpired = otpExpired;
    await admin.save();

    await sendResetPasswordEmail(email, otp);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Email not registered" });
    }

    if (admin.otp !== otp || admin.otpExpired < Date.now()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
    admin.otp = undefined;
    admin.otpExpired = undefined;
    await admin.save();

    res.json({ success: true, message: "Password reset successfully" });
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
  getDailyCountsUserSellerMentor,
  getAllUserSellerMentor,
  getAllAdmin,
  activedAdmin,
  getAllUser,
  getAllSeller,
  getAllMentor,
  forgotPassword,
  resetPassword,
};
