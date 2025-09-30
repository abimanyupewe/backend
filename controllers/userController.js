import jwt from "jsonwebtoken";
import userModel from "../models/userModels.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { sendOTPCode } from "../middleware/Email.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
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
    const otpExpired = Date.now() + 5 * 60 * 1000; // 5 menit dari sekarang

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
    const { id, ...updateData } = req.body;

    // Ambil data user lama
    const oldUser = await userModel.findById(id);
    if (!oldUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // Jika field tidak diisi, isi dengan data lama
    updateData.name = updateData.name || oldUser.name;
    updateData.email = updateData.email || oldUser.email;

    // Validasi email jika diubah
    if (updateData.email && updateData.email !== oldUser.email) {
      if (!validator.isEmail(updateData.email)) {
        return res.json({
          success: false,
          message: "Please enter a valid email address",
        });
      }

      // Cek duplikasi email baru
      const emailExists = await userModel.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (emailExists) {
        return res.json({
          success: false,
          message: "Email already exists",
        });
      }
    }

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

export { loginUser, registerUser, updateUser, deleteUser, verOTP };
