import sellerModel from "../models/sellerModel.js";
import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import bcrypt from "bcrypt";
import { sendOTPCode } from "../middleware/Email.js";
import jwt from "jsonwebtoken";

const createToken = (seller) => {
  return jwt.sign(
    {
      id: seller._id,
      shopName: seller.shopName,
      name: seller.name,
      email: seller.email,
      role: "seller",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const loginSeller = async (req, res) => {
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

    const seller = await sellerModel.findOne({ email });

    if (!seller) {
      return res.json({ success: false, message: "Seller doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);

    if (isMatch) {
      const token = createToken(seller);
      res.json({ success: true, message: "Login successful", token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Register seller (buat seller baru)
const registerSeller = async (req, res) => {
  try {
    const { shopName, email, password, repassword } = req.body;

    // Validasi field wajib
    if (!shopName || !email) {
      return res.json({
        success: false,
        message: "Shop name and email are required",
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
    const exists = await sellerModel.findOne({ email });
    if (exists) {
      return res.json({
        success: false,
        message: "Email already exists",
      });
    }

    // Validasi password
    if (!password || !repassword) {
      return res.json({
        success: false,
        message: "Password and re-password are required",
      });
    }
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

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpired = Date.now() + 1 * 60 * 1000; // 1 menit

    // Buat seller baru
    const sellerData = new sellerModel({
      shopName,
      email,
      otp,
      otpExpired,
      password: hashedPassword,
      isVerifed: false,
      isOfficial: false,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await sellerData.save();

    // Kirim OTP ke email
    try {
      await sendOTPCode(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError.message);
      // Hapus seller jika email gagal dikirim
      await sellerModel.findByIdAndDelete(sellerData._id);
      return res.json({
        success: false,
        message: "Failed to send OTP email, please try again",
      });
    }

    res.json({
      success: true,
      message: "Seller registered successfully, OTP sent to email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all sellers
const listSellers = async (req, res) => {
  try {
    const sellers = await sellerModel.find({});
    res.json({ success: true, sellers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update seller
const updateSeller = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    const dataSeller = await sellerModel.findById(id);

    if (!dataSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // Jika field tidak diisi, isi dengan data lama
    updateData.email = updateData.email || dataSeller.email;
    updateData.shopName = updateData.shopName || dataSeller.shopName;

    // Validasi email jika diubah
    if (updateData.email && updateData.email !== dataSeller.email) {
      if (!validator.isEmail(updateData.email)) {
        return res.json({
          success: false,
          message: "Please enter a valid email address",
        });
      }

      // Cek duplikasi email baru
      const emailExists = await sellerModel.findOne({
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

    const image = req.files?.profileImage?.[0];
    if (image) {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
      });
      updateData.profileImage = result.secure_url;
    }

    const seller = await sellerModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json({ success: true, message: "Seller updated", seller });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove seller
const removeSeller = async (req, res) => {
  try {
    const seller = await sellerModel.findByIdAndDelete(req.body.id);
    if (!seller) {
      return res.json({ success: false, message: "Seller not found" });
    }
    res.json({ success: true, message: "Seller removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single seller
const singleSeller = async (req, res) => {
  try {
    const seller = await sellerModel.findById(req.body.id);
    if (!seller) {
      return res.json({ success: false, message: "Seller not found" });
    }
    res.json({ success: true, seller });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verifikasi OTP seller
const verifySellerOTP = async (req, res) => {
  try {
    const { code } = req.body;

    const seller = await sellerModel.findOne({ otp: code });

    if (!seller) {
      return res.json({ success: false, message: "Invalid OTP code" });
    }

    if (seller.otpExpired < Date.now()) {
      await sellerModel.findByIdAndDelete(seller._id);
      return res.json({
        success: false,
        message: "OTP code has expired, please register again",
      });
    }

    seller.isVerifed = true;
    seller.otp = undefined;
    seller.otpExpired = undefined;
    await seller.save();

    res.json({
      success: true,
      message: "Seller email verified successfully",
      seller: {
        id: seller._id,
        shopName: seller.shopName,
        email: seller.email,
        isVerifed: seller.isVerifed,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const rateSeller = async (req, res) => {
  try {
    const { sellerId, value, comment } = req.body;
    const userId = req.user._id; // dari autentikasi

    // Validasi input
    if (!sellerId || !value) {
      return res.json({
        success: false,
        message: "Seller ID and rating value are required",
      });
    }

    if (value < 1 || value > 5) {
      return res.json({
        success: false,
        message: "Rating value must be between 1 and 5",
      });
    }

    // Cek apakah user sudah pernah rating seller ini
    const seller = await sellerModel.findById(sellerId);
    if (!seller) {
      return res.json({ success: false, message: "Seller not found" });
    }

    const existing = seller.ratings.find((r) => r.user.toString() === userId);

    if (existing) {
      // Update rating lama
      existing.value = value;
      existing.comment = comment || "";
      existing.updatedAt = new Date();
    } else {
      // Tambah rating baru
      seller.ratings.push({
        user: userId,
        value,
        comment: comment || "",
        createdAt: new Date(),
      });
    }

    // Hitung rata-rata rating
    const avg =
      seller.ratings.reduce((sum, r) => sum + r.value, 0) /
      seller.ratings.length;
    seller.rating = Math.round(avg * 10) / 10; // Bulatkan ke 1 desimal

    await seller.save();

    res.json({
      success: true,
      message: existing ? "Rating updated" : "Rating added",
      rating: seller.rating,
      totalRatings: seller.ratings.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend OTP function (bonus)
const resendSellerOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const seller = await sellerModel.findOne({ email, isVerifed: false });
    if (!seller) {
      return res.json({
        success: false,
        message: "Seller not found or already verified",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpired = Date.now() + 5 * 60 * 1000; // 5 menit

    seller.otp = otp;
    seller.otpExpired = otpExpired;
    await seller.save();

    // Kirim OTP baru ke email
    try {
      await sendOTPCode(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError.message);
      return res.json({
        success: false,
        message: "Failed to send OTP email, please try again",
      });
    }

    res.json({
      success: true,
      message: "New OTP sent to email",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  registerSeller,
  loginSeller,
  listSellers,
  updateSeller,
  removeSeller,
  singleSeller,
  verifySellerOTP,
  rateSeller,
  resendSellerOTP,
};
