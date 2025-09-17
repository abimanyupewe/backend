import sellerModel from "../models/sellerModel.js";
import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import bcrypt from "bcrypt";
import { sendOTPCode } from "../middleware/Email.js";
import { sendOTPWhatsApp } from "../middleware/WhatsApp.js";
import jwt from "jsonwebtoken";
// import userModel from "../models/userModels.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const loginSeller = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.json({
        success: false,
        message: "emailOrPhone and password are required",
      });
    }

    let seller;
    if (validator.isEmail(emailOrPhone)) {
      seller = await sellerModel.findOne({ email: emailOrPhone });
    } else if (validator.isMobilePhone(emailOrPhone, "id-ID")) {
      seller = await sellerModel.findOne({ phone: emailOrPhone });
    } else {
      return res.json({
        success: false,
        message: "Input must be a valid email or phone number",
      });
    }

    if (!seller) {
      return res.json({ success: false, message: "Seller doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);

    if (isMatch) {
      const token = createToken(seller._id);
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
    const { name, shopName, emailOrPhone, password, repassword } = req.body;

    // Deteksi email atau phone dari input
    const isEmail = validator.isEmail(emailOrPhone);
    const isPhone = validator.isMobilePhone(emailOrPhone, "id-ID");
    if (!isEmail && !isPhone) {
      return res.json({
        success: false,
        message: "Contact must be a valid email or phone number",
      });
    }

    // Cek duplikasi
    let exists;
    if (isEmail) {
      exists = await sellerModel.findOne({ email: emailOrPhone });
      if (exists)
        return res.json({ success: false, message: "Email already exists" });
    }
    if (isPhone) {
      exists = await sellerModel.findOne({ phone: emailOrPhone });
      if (exists)
        return res.json({ success: false, message: "Phone already exists" });
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
      name,
      shopName,
      email: isEmail ? emailOrPhone : undefined,
      phone: isPhone ? emailOrPhone : undefined,
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

    // Kirim OTP ke email atau WhatsApp
    if (isEmail) {
      sendOTPCode(emailOrPhone, otp);
    } else if (isPhone) {
      sendOTPWhatsApp(emailOrPhone, otp);
    }

    res.json({
      success: true,
      message: "Seller registered, OTP sent",
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

    const dataUser = await sellerModel.findById(id);

    if (!dataUser) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    updateData.email = updateData.email || dataUser.email;
    updateData.phone = updateData.phone || dataUser.phone;
    updateData.shopName = updateData.shopName || dataUser.shopName;
    updateData.name = updateData.name || dataUser.name;

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
    await sellerModel.findByIdAndDelete(req.body.id);
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
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (seller.otpExpired < Date.now()) {
      await sellerModel.findByIdAndDelete(seller._id);
      return res.json({
        success: false,
        message: "OTP expired, please register again",
      });
    }

    seller.isVerifed = true;
    seller.otp = undefined;
    seller.otpExpired = undefined;
    await seller.save();

    res.json({ success: true, message: "Seller verified", seller });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const rateSeller = async (req, res) => {
  try {
    const { sellerId, value, comment } = req.body;
    const userId = req.user._id; // dari autentikasi

    // Cek apakah user sudah pernah rating seller ini
    const seller = await sellerModel.findById(sellerId);
    const existing = seller.ratings.find((r) => r.user.toString() === userId);

    if (existing) {
      // Update rating lama
      existing.value = value;
      existing.comment = comment;
    } else {
      // Tambah rating baru
      seller.ratings.push({ user: userId, value, comment });
    }


    if (existing) {
      // Update rating lama
      existing.value = value;
      existing.comment = comment;
    } else {
      // Tambah rating baru
      product.ratings.push({ user: userId, value, comment });
    }

    // Hitung rata-rata rating
    const avg =
      product.ratings.reduce((sum, r) => sum + r.value, 0) /
      product.ratings.length;
    product.rating = avg;

    await product.save();

    res.json({
      success: true,
      rating: product.rating,
      ratings: product.ratings,
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
};
