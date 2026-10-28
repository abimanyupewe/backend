import voucherModel from "../models/voucherModel.js";
import adminModel from "../models/adminModel.js";
import mongoose from "mongoose";

// Buat Voucher Baru (Umum / Mitra)
export const createVoucher = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      product,
      course,
      role,
      createdBy,
    } = req.body;

    // Pastikan user menyertakan data
    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return res.status(400).json({ success: false, message: "Data voucher tidak lengkap" });
    }

    // Seller/mentor hanya boleh membuat voucher atas namanya sendiri.
    const own = req.auth && !["superadmin", "admin"].includes(req.auth.role);
    let creatorId = own ? req.auth.id : createdBy;
    if (!creatorId) {
      const admin = await adminModel.findOne({});
      creatorId = admin ? admin._id : new mongoose.Types.ObjectId();
    }

    const newVoucher = new voucherModel({
      code: code.toUpperCase().trim(),
      description: description || "",
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      product: product || null,
      course: course || null,
      role: own ? req.auth.role : role || "admin",
      createdBy: creatorId,
      isActive: true,
    });

    await newVoucher.save();
    res.status(201).json({
      success: true,
      message: "Voucher berhasil dibuat",
      data: newVoucher,
      voucher: newVoucher,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Kode voucher sudah digunakan" });
    }
    console.error("Gagal membuat voucher:", error);
    res.status(500).json({ success: false, message: "Gagal membuat voucher", error: error.message });
  }
};

// Buat Voucher Global Platform (Admin)
export const createGlobalVoucher = async (req, res) => {
  return createVoucher(req, res);
};

// List Semua Voucher Global / Seluruh Platform
export const getGlobalVouchers = async (req, res) => {
  try {
    const vouchers = await voucherModel.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: vouchers,
      vouchers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat voucher", error: error.message });
  }
};

// List Voucher (By Role & Creator ID)
export const getVouchersByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    if (req.auth && !["superadmin", "admin"].includes(req.auth.role) && creatorId !== req.auth.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const vouchers = await voucherModel.find({ createdBy: creatorId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: vouchers, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat voucher", error: error.message });
  }
};

// Hapus Voucher Global
export const deleteGlobalVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    await voucherModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Voucher berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menghapus voucher", error: error.message });
  }
};

// Hapus Voucher (Route /delete/:id)
export const deleteVoucher = async (req, res) => {
  if (req.auth && !["superadmin", "admin"].includes(req.auth.role)) {
    const owned = await voucherModel.exists({ _id: req.params.id, createdBy: req.auth.id });
    if (!owned) return res.status(403).json({ success: false, message: "Access denied" });
  }
  return deleteGlobalVoucher(req, res);
};

// Validasi Voucher (Saat Checkout Pembeli)
export const validateVoucher = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Kode voucher diperlukan" });
    }

    const voucher = await voucherModel.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Kode voucher tidak ditemukan atau sudah tidak aktif",
      });
    }

    const now = new Date();
    if (now < new Date(voucher.validFrom)) {
      return res.status(400).json({
        success: false,
        message: "Voucher belum dapat digunakan",
      });
    }

    if (now > new Date(voucher.validUntil)) {
      return res.status(400).json({
        success: false,
        message: "Masa berlaku voucher telah berakhir",
      });
    }

    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Kuota penggunaan voucher telah habis",
      });
    }

    if (voucher.minPurchase && Number(cartTotal) < voucher.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimal belanja untuk voucher ini adalah Rp ${voucher.minPurchase.toLocaleString("id-ID")}`,
      });
    }

    // Hitung potongan diskon
    let discount = 0;
    if (voucher.discountType === "percent") {
      discount = (Number(cartTotal || 0) * voucher.discountValue) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.discountValue;
    }

    // Pastikan diskon tidak melebihi total belanja
    if (cartTotal && discount > Number(cartTotal)) {
      discount = Number(cartTotal);
    }

    res.status(200).json({
      success: true,
      message: "Voucher berhasil diterapkan!",
      voucher,
      discount: Math.round(discount),
    });
  } catch (error) {
    console.error("validateVoucher error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
