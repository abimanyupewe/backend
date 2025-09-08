import jwt from "jsonwebtoken";
import userModel from "../models/userModels.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { sendOTPCode } from "../middleware/Email.js";
import {
  sendOTPWhatsApp,
  sendVerifiedWhatsApp,
} from "../middleware/WhatsApp.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.json({
        success: false,
        message: "emailOrPhone and password are required",
      });
    }

    // Deteksi email atau phone
    let user;
    if (validator.isEmail(emailOrPhone)) {
      user = await userModel.findOne({ email: emailOrPhone });
    } else if (validator.isMobilePhone(emailOrPhone, "id-ID")) {
      user = await userModel.findOne({ phone: emailOrPhone });
    } else {
      return res.json({
        success: false,
        message: "Input must be a valid email or phone number",
      });
    }

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
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
    const { name, emailOrPhone, password, repassword } = req.body;

    // Validasi field wajib
    if (!name || !emailOrPhone) {
      return res.json({
        success: false,
        message: "Name and emailOrPhone are required",
      });
    }

    // Deteksi email atau phone
    const isEmail = validator.isEmail(emailOrPhone);
    const isPhone = validator.isMobilePhone(emailOrPhone, "id-ID");

    if (!isEmail && !isPhone) {
      return res.json({
        success: false,
        message: "emailOrPhone must be a valid email or phone number",
      });
    }

    // Cek duplikasi
    let exists;
    if (isEmail) {
      exists = await userModel.findOne({ email: emailOrPhone });
    } else {
      exists = await userModel.findOne({ phone: emailOrPhone });
    }
    if (exists) {
      return res.json({
        success: false,
        message: isEmail ? "Email already exists" : "Phone already exists",
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

    // hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpired = Date.now() + 1 * 60 * 1000; // 1 menit dari sekarang

    // Buat user baru
    const newUser = new userModel({
      name,
      email: isEmail ? emailOrPhone : undefined,
      phone: isPhone ? emailOrPhone : undefined,
      otp,
      otpExpired,
      isVerifed: false,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    // Kirim OTP ke email atau phone
    if (isEmail) {
      sendOTPCode(emailOrPhone, otp);
    } else if (isPhone) {
      sendOTPWhatsApp(name, emailOrPhone, otp);
    }

    res.json({
      success: true,
      message: "User registered successfully, OTP sent",
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
    const { id, ...updateData } = req.body;

    // Ambil data user lama
    const oldUser = await userModel.findById(id);

    // Jika field tidak diisi, isi dengan data lama
    updateData.name = updateData.name || oldUser.name;
    updateData.email = updateData.email || oldUser.email;
    updateData.phone = updateData.phone || oldUser.phone;

    // Ambil file gambar jika ada
    const image = req.files?.profileImage?.[0];
    if (image) {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
      });
      updateData.profileImage = result.secure_url;
    }

    const user = await userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.json({ success: true, message: "User updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      return res.json({ success: false, message: "invalid OTP code" });
    }

    // cek apakah OTP sudah expired
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
    if (user.phone) {
      sendVerifiedWhatsApp(user.name, user.phone);
    }

    res.json({ success: true, message: "OTP verified successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, updateUser, deleteUser, verOTP };
