import sellerModel from "../models/sellerModel.js";
import { v2 as cloudinary } from "cloudinary";

// Register seller (buat seller baru)
const registerSeller = async (req, res) => {
  try {
    const { name, shopName, address, phone, email, user } =
      req.body;

    const fotoProfile = req.files?.image?.[0].filter(
      (item) => item !== undefined
    );

    console.log(req.files);
    console.log(fotoProfile);

    // upload ke cloudinary
    let imageUrl = await Promise.all(
      fotoProfile.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    console.log(imageUrl);

    const sellerData = new sellerModel({
      name,
      shopName,
      address,
      phone: Number(phone),
      email,
      profileImage: imageUrl,
      user,
      rating: 0,
      productCount: 0,
      soldCount: 0,
      isOfficial: isOfficial === "false" ? true : false,
      status: status === "true" ? true : false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await sellerData.save();
    res.json({ success: true, message: "Seller registered", seller: sellerData });
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

export {
  registerSeller,
  listSellers,
  updateSeller,
  removeSeller,
  singleSeller,
};
