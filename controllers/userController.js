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
    const user = await userModel.findOne({ email });
    if (!user) {
      // jika user tidak ditemukan
      return res.json({ success: false, message: "User doesn't exists" });
    }

    // mencocokan passowrd yang sudah berbentuk hash dari register
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // akan di generate ulang token yang di inputkan user dan nanti akan dibandingkan dengan token yang sudah ada dalam db regsiter
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

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Input must be a valid email address",
      });
    }

    // cek duplikasi email
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email already exists" });
    }

    // validasi password
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
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
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

    const user = await newUser.save();
    sendOTPCode(email, otp);

    res.json({
      success: true,
      message: "User registered successfully, otp sent to email",
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
    const user = await userModel.findOne({ code });
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

    res.json({ success: true, message: "OTP verified successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, updateUser, deleteUser, verOTP };
