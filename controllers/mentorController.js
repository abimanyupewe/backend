import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import bcrypt from "bcrypt";
import { sendOTPCode } from "../middleware/Email.js";
import jwt from "jsonwebtoken";
import mentorModel from "../models/mentorModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const loginMentor = async (req, res) => {
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

    const mentor = await mentorModel.findOne({ email });

    if (!mentor) {
      return res.json({ success: false, message: "Mentor doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, mentor.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(mentor._id);
    res.json({ success: true, message: "Login successful", token, mentor });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const registerMentor = async (req, res) => {
  try {
    const { name, email, password, repassword, expertise, experience } = req.body;

    // Validasi field wajib
    if (!name || !email || !expertise) {
      return res.json({
        success: false,
        message: "Name, email, and expertise are required",
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
    const exists = await mentorModel.findOne({ email });
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

    // Simpan mentor baru ke database
    const mentor = new mentorModel({
      name,
      email,
      expertise,
      experience: experience || "",
      password: hashedPassword,
      otp,
      otpExpired,
      isVerifed: false,
      isApprovedByAdmin: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mentor.save();

    // Kirim OTP ke email
    try {
      await sendOTPCode(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError.message);
      // Hapus mentor jika email gagal dikirim
      await mentorModel.findByIdAndDelete(mentor._id);
      return res.json({
        success: false,
        message: "Failed to send OTP email, please try again",
      });
    }

    res.json({
      success: true,
      message: "Mentor registered successfully, OTP sent to email",
    });
  } catch (error) {
    console.error(error);
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

    // Jika field tidak diisi, isi dengan data lama
    updateData.name = updateData.name || dataMentor.name;
    updateData.email = updateData.email || dataMentor.email;
    updateData.expertise = updateData.expertise || dataMentor.expertise;
    updateData.experience = updateData.experience || dataMentor.experience;

    // Validasi email jika diubah
    if (updateData.email && updateData.email !== dataMentor.email) {
      if (!validator.isEmail(updateData.email)) {
        return res.json({
          success: false,
          message: "Please enter a valid email address",
        });
      }

      // Cek duplikasi email baru
      const emailExists = await mentorModel.findOne({
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
    console.error(error);
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

    const mentor = await mentorModel.findByIdAndDelete(id);
    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found" });
    }

    res.json({ success: true, message: "Mentor deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllMentors = async (req, res) => {
  try {
    const { status, expertise } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.isApprovedByAdmin = status;
    if (expertise) filter.expertise = new RegExp(expertise, 'i');

    const mentors = await mentorModel.find(filter).select('-password -otp -otpExpired');
    res.json({ success: true, mentors, count: mentors.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMentor = async (req, res) => {
  try {
    const mentor = await mentorModel.findById(req.params.id).select('-password -otp -otpExpired');
    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found" });
    }
    res.json({ success: true, mentor });
  } catch (error) {
    console.error(error);
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
        message: "Invalid OTP code",
      });
    }

    // Cek apakah OTP sudah expired
    if (mentor.otpExpired < Date.now()) {
      await mentorModel.findByIdAndDelete(mentor._id);
      return res.json({
        success: false,
        message: "OTP code has expired, please register again",
      });
    }

    mentor.isVerifed = true;
    mentor.otp = undefined;
    mentor.otpExpired = undefined;
    await mentor.save();

    res.json({
      success: true,
      message: "Mentor email verified successfully",
      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        expertise: mentor.expertise,
        isVerifed: mentor.isVerifed,
        isApprovedByAdmin: mentor.isApprovedByAdmin
      }
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Approve/Reject mentor by admin
const approveMentor = async (req, res) => {
  try {
    const { id, status } = req.body; // status: 'approved' or 'rejected'

    if (!id || !status) {
      return res.json({
        success: false,
        message: "Mentor ID and status are required",
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.json({
        success: false,
        message: "Status must be 'approved' or 'rejected'",
      });
    }

    const mentor = await mentorModel.findById(id);
    if (!mentor) {
      return res.json({ success: false, message: "Mentor not found" });
    }

    mentor.isApprovedByAdmin = status;
    mentor.updatedAt = new Date();
    await mentor.save();

    res.json({
      success: true,
      message: `Mentor ${status} successfully`,
      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        expertise: mentor.expertise,
        isApprovedByAdmin: mentor.isApprovedByAdmin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend OTP function (bonus)
const resendMentorOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const mentor = await mentorModel.findOne({ email, isVerifed: false });
    if (!mentor) {
      return res.json({
        success: false,
        message: "Mentor not found or already verified",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpired = Date.now() + 5 * 60 * 1000; // 5 menit

    mentor.otp = otp;
    mentor.otpExpired = otpExpired;
    await mentor.save();

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
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
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
  approveMentor,
  resendMentorOTP,
};