import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import bcrypt from "bcrypt";
import { sendOTPCode } from "../middleware/Email.js";
import { sendOTPWhatsApp } from "../middleware/WhatsApp.js";
import jwt from "jsonwebtoken";
import mentorModel from "../models/mentorModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const loginMentor = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.json({
        success: false,
        message: "emailOrPhone and password are required",
      });
    }

    let mentor;
    if (validator.isEmail(emailOrPhone)) {
      mentor = await mentorModel.findOne({ email: emailOrPhone });
    } else if (validator.isMobilePhone(emailOrPhone, "id-ID")) {
      mentor = await mentorModel.findOne({ phone: emailOrPhone });
    } else {
      return res.json({
        success: false,
        message: "Input must be a valid email or phone number",
      });
    }

    if (!mentor) {
      return res.json({ success: false, message: "Mentor doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, mentor.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = createToken(mentor._id);
    res.json({ success: true, message: "Login successful", token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const registerMentor = async (req, res) => {
  try {
    const { emailOrPhone, password, repassword } = req.body;

    // Deteksi email atau phone dari input
    const isEmail = validator.isEmail(emailOrPhone);
    const isPhone = validator.isMobilePhone(emailOrPhone, "id-ID");

    if (!isEmail && !isPhone) {
      return res.json({
        success: false,
        message: "Input must be a valid email or phone number",
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
    const otpExpired = Date.now() + 1 * 30 * 1000; // 1 menit

    // Simpan mentor baru ke database
    const mentor = new mentorModel({
      email: isEmail ? emailOrPhone : undefined,
      phone: isPhone ? emailOrPhone : undefined,
      password: hashedPassword,
      otp,
      otpExpired,
      isVerifed: false,
      isApprovedByAdmin: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mentor.save();

    // Kirim OTP ke email atau WhatsApp
    if (isEmail) {
      sendOTPCode(emailOrPhone, otp);
    } else if (isPhone) {
      sendOTPWhatsApp(emailOrPhone, otp);
    }

    res.json({
      success: true,
      message: "Mentor registered, OTP sent",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

const updateMentor = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Mentor ID is required" });

    const dataMentor = await mentorModel.findById(id);
    if (!dataMentor) {
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found" });
    }

    updateData.email = updateData.email || dataMentor.email;
    updateData.phone = updateData.phone || dataMentor.phone;

    // Handle certificates (multiple file support)
    if (req.files?.certificates) {
      updateData.certificates = dataMentor.certificates || [];
      for (const certif of req.files.certificates) {
        const result = await cloudinary.uploader.upload(certif.path, {
          resource_type: "image",
        });
        updateData.certificates.push(result.secure_url);
      }
    }

    // Handle profile image
    const image = req.files?.profileImage?.[0];
    if (image) {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
      });
      updateData.profileImage = result.secure_url;
    }

    const mentor = await mentorModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json({ success: true, message: "Mentor updated", mentor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMentor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Mentor ID is required" });

    await mentorModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Mentor deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllMentors = async (req, res) => {
  try {
    const mentors = await mentorModel.find();
    res.json({ success: true, mentors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMentor = async (req, res) => {
  try {
    const mentor = await mentorModel.findById(req.params.id);
    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found" });
    }
    res.json({ success: true, mentor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyMentorOtp = async (req, res) => {
  try {
    const { code } = req.body;
    const mentor = await mentorModel.findOne({ otp: code });

    // Cek mentor dan validasi OTP
    if (!mentor) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Cek apakah OTP sudah expired
    if (mentor.otpExpired < Date.now()) {
      return res.json({
        success: false,
        message: "OTP has expired",
      });
    }

    mentor.isVerifed = true;
    mentor.otp = undefined;
    mentor.otpExpired = undefined;
    await mentor.save();

    res.json({
      success: true,
      message: "Mentor verified successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export {
  loginMentor,
  registerMentor,
  updateMentor,
  deleteMentor,
  getAllMentors,
  getMentor,
  verifyMentorOtp,
};
