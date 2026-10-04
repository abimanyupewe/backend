import voucherModel from "../models/voucherModel.js";

// Buat Voucher Baru
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
    if (!code || !discountType || !discountValue || !validFrom || !validUntil || !role || !createdBy) {
      return res.status(400).json({ success: false, message: "Data voucher tidak lengkap" });
    }

    const newVoucher = new voucherModel({
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
      isActive: true,
    });

    await newVoucher.save();
    res.status(201).json({ success: true, message: "Voucher berhasil dibuat", voucher: newVoucher });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Kode voucher sudah digunakan" });
    }
    console.error("Gagal membuat voucher:", error);
    res.status(500).json({ success: false, message: "Gagal membuat voucher", error: error.message });
  }
};

// List Voucher (By Role & ID)
export const getVouchersByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    
    // Cari semua voucher yang dibuat oleh ID ini
    const vouchers = await voucherModel.find({ createdBy: creatorId }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memuat voucher", error: error.message });
  }
};

// Hapus Voucher
export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    await voucherModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Voucher berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menghapus voucher", error: error.message });
  }
};
