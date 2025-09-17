import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
    },
    socialMedia: {
      type: Map,
      of: String, // contoh: { instagram: "...", linkedin: "..." }
    },
    address: {
      type: String,
    },
    expertise: {
      type: [String],
      required: true,
    },
    certificates: [String],
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
    email: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        value: { type: Number, min: 1, max: 5 },
        comment: { type: String },
      },
    ],
    courseCount: {
      type: Number,
      default: 0,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    profileImage: {
      type: String,
    },
    isApprovedByAdmin: { type: Boolean, default: false },
    isVerifed: { type: Boolean, default: false },
    otp: {
      type: String,
      trim: true,
    },
    otpExpired: {
      type: Date,
    },
    status: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Mentor = mongoose.model("Mentor", mentorSchema);

export default Mentor;
