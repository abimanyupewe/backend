import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import userModel from "../models/userModels.js";
import adminModel from "../models/adminModel.js";
import sellerModel from "../models/sellerModel.js";
import mentorModel from "../models/mentorModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { sendOTPCode } from "../middleware/Email.js";

const createToken = (user) => {
  const id = user._id || user.id || user;
  return jwt.sign(
    {
      id,
      email: user.email || "",
      name: user.name || "",
      role: "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Validasi email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user);
      res.json({ success: true, token, role: "user" });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, repassword } = req.body;

    // Validasi field wajib
    if (!name || !email) {
      return res.json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Validasi email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Cek duplikasi email
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({
        success: false,
        message: "Email already exists",
      });
    }

    // Validasi password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }
    if (!/[A-Z]/.test(password)) {
      return res.json({
        success: false,
        message: "Password must contain at least one uppercase letter",
      });
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      return res.json({
        success: false,
        message: "Password must contain at least one special character",
      });
    }
    if (password !== repassword) {
      return res.json({
        success: false,
        message: "Password and re-password do not match",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpired = Date.now() + 1 * 60 * 1000; // 1 menit dari sekarang

    // Buat user baru
    const newUser = new userModel({
      name,
      email,
      otp,
      otpExpired,
      isVerifed: false,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    // Kirim OTP ke email
    try {
      await sendOTPCode(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError.message);
      // Hapus user jika email gagal dikirim
      await userModel.findByIdAndDelete(newUser._id);
      return res.json({
        success: false,
        message: "Failed to send OTP email, please try again",
      });
    }

    res.json({
      success: true,
      message: "User registered successfully, OTP sent to email",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.body.id || req.body.userId || req.body._id;
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.userId;
    delete updateData._id;

    if (!id) {
      return res.json({ success: false, message: "User ID is required" });
    }

    let oldUser = null;
    let modelType = "user";
    if (mongoose.Types.ObjectId.isValid(id)) {
      oldUser = await userModel.findById(id);
      if (!oldUser) {
        oldUser = await adminModel.findById(id);
        if (oldUser) modelType = "admin";
      }
      if (!oldUser) {
        oldUser = await sellerModel.findById(id);
        if (oldUser) modelType = "seller";
      }
      if (!oldUser) {
        oldUser = await mentorModel.findById(id);
        if (oldUser) modelType = "mentor";
      }
    }

    if (!oldUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // Jika field tidak diisi, isi dengan data lama
    updateData.name = updateData.name || oldUser.name;

    // Guard: Validasi email & password jika email diubah
    const requestedEmail = updateData.email?.trim().toLowerCase();
    const currentEmail = oldUser.email?.trim().toLowerCase();

    if (requestedEmail && requestedEmail !== currentEmail) {
      if (!validator.isEmail(requestedEmail)) {
        return res.json({
          success: false,
          message: "Format alamat email tidak valid",
        });
      }

      // Password Guard: Wajib konfirmasi kata sandi
      const passwordConfirmation = req.body.password || req.body.currentPassword;
      if (!passwordConfirmation) {
        return res.json({
          success: false,
          message: "Kata sandi akun wajib diisi untuk mengonfirmasi perubahan alamat email",
        });
      }

      if (oldUser.password) {
        const isMatch = await bcrypt.compare(passwordConfirmation, oldUser.password);
        if (!isMatch) {
          return res.json({
            success: false,
            message: "Kata sandi akun salah. Gagal memperbarui alamat email",
          });
        }
      }

      // Cek duplikasi email baru di database
      const emailExists = await userModel.findOne({
        email: requestedEmail,
        _id: { $ne: id },
      });
      if (emailExists) {
        return res.json({
          success: false,
          message: "Alamat email sudah digunakan oleh akun lain",
        });
      }

      updateData.email = requestedEmail;
    } else {
      updateData.email = oldUser.email;
    }

    // Jangan ubah password lewat updateUser
    delete updateData.password;
    delete updateData.currentPassword;

    // Ambil file gambar jika ada
    const image = req.files?.profileImage?.[0];
    if (image) {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
      });
      updateData.profileImage = result.secure_url;
    }

    let updatedUser = null;
    if (modelType === "admin") {
      updatedUser = await adminModel.findByIdAndUpdate(id, updateData, { new: true });
    } else if (modelType === "seller") {
      updatedUser = await sellerModel.findByIdAndUpdate(id, updateData, { new: true });
    } else if (modelType === "mentor") {
      updatedUser = await mentorModel.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      updatedUser = await userModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    return res.json({
      success: true,
      message: "Profil Anda berhasil diperbarui",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;

    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verOTP = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await userModel.findOne({ otp: code });
    if (!user) {
      return res.json({ success: false, message: "Invalid OTP code" });
    }

    // Cek apakah OTP sudah expired
    if (user.otpExpired < Date.now()) {
      await userModel.findByIdAndDelete(user._id);
      return res.json({
        success: false,
        message: "OTP code has expired, please register again",
      });
    }

    user.isVerifed = true;
    user.otp = undefined;
    user.otpExpired = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerifed: user.isVerifed,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.body?.userId || req.headers?.userid || req.query?.id || req.userId;
    if (!userId) {
      return res.json({ success: false, message: "User ID is required", user: null });
    }

    let user = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await userModel.findById(userId).select("-password -otp -otpExpired");
      if (!user) {
        user = await adminModel.findById(userId).select("-password -otp -otpExpired");
      }
      if (!user) {
        user = await sellerModel.findById(userId).select("-password");
      }
      if (!user) {
        user = await mentorModel.findById(userId).select("-password");
      }
    }

    if (!user) {
      return res.json({ success: false, message: "User not found", user: null });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message, user: null });
  }
};

const changePassword = async (req, res) => {
  try {
    const rawToken =
      req.headers.token ||
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    let userId = req.body.userId || req.body.id;
    if (rawToken && !userId) {
      try {
        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch {}
    }

    if (!userId) {
      return res.json({ success: false, message: "ID pengguna tidak ditemukan" });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.json({
        success: false,
        message: "Password saat ini dan password baru wajib diisi",
      });
    }

    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "Password baru minimal 8 karakter",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.json({
        success: false,
        message: "Konfirmasi password baru tidak cocok",
      });
    }

    let user = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await userModel.findById(userId);
      if (!user) {
        user = await adminModel.findById(userId);
      }
      if (!user) {
        user = await sellerModel.findById(userId);
      }
      if (!user) {
        user = await mentorModel.findById(userId);
      }
    }

    if (!user) {
      return res.json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    if (!user.password) {
      return res.json({
        success: false,
        message: "Akun ini belum memiliki kata sandi terdaftar",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Password saat ini tidak sesuai",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({
      success: true,
      message: "Password berhasil diperbarui",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, updateUser, deleteUser, verOTP, getUserProfile, changePassword };

