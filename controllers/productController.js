import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, bestseller } = req.body;

    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    console.log("req.files:", req.files);

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );
    console.log(name, description, price, category, stock, bestseller);
    console.log("images:", images);

    if (images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No image files uploaded." });
    }

    // Upload gambar ke Cloudinary
    let imageUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    console.log("Image URLs:", imageUrl);

    // Buat objek produk untuk MongoDB
    const productData = new productModel({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      rating: 0, // default rating
      bestSeller: bestseller === "true" ? true : false,
      image: imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Simpan ke database
    await productData.save();

    console.log("Produk berhasil ditambahkan:", productData);

    res.json({ success: true, message: "Product Added", product: productData });
  } catch (error) {
    console.error("Error saat menambahkan produk:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id, name, description, price, category, stock, bestseller } =
      req.body;

    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    console.log("req.files:", req.files);

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );
    console.log(name, description, price, category, stock, bestseller);
    console.log("images:", images);

    if (images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No image files uploaded." });
    }

    // Upload gambar ke Cloudinary
    let imageUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    console.log("Image URLs:", imageUrl);

    // Siapkan data yang akan diupdate
    const updateData = {
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: imageUrl,
      bestSeller: bestseller === "true" ? true : false,
      updatedAt: new Date(),
    };

    // Update data di database
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Product Updated",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error saat update produk:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);

    res.json({ success: false, message: error.message });
  }
};
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);

    res.json({ success: true, product });
  } catch (error) {
    console.log(error);

    res.json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  listProducts,
  updateProduct,
  removeProduct,
  singleProduct,
};
