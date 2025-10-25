import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import sellerModel from "../models/sellerModel.js";

const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, bestseller, preOrder, seller, voucher } =
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

    // Buat objek produk untuk MongoDB
    const productData = new productModel({
      seller,
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      preOrder: preOrder === "true" ? true : false,
      voucher: voucher ? voucher : null,
      rating: 0, // default rating
      bestSeller: bestseller === "true" ? true : false,
      image: imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Simpan ke database
    await productData.save();

    // Tambah productCount pada seller
    await sellerModel.findByIdAndUpdate(seller, {
      $inc: { productCount: 1 },
    });

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
    // await productModel.findByIdAndDelete(req.body.id);

    const { productId } = req.body; // atau req.params

    // Temukan produk yang akan dihapus
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Simpan sellerId sebelum hapus
    const sellerId = product.seller;

    // Hapus produk
    await productModel.findByIdAndDelete(productId);

    // Kurangi productCount pada seller
    await sellerModel.findByIdAndUpdate(sellerId, {
      $inc: { productCount: -1 },
    });
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

const getProductsSeller = async (req, res) => {
  try {
    const { seller } = req.params; // seller dari URL
    const products = await productModel.find({ seller });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rateProduct = async (req, res) => {
  try {
    const { productId, value, comment } = req.body;
    const userId = req.user._id; // dari autentikasi

    // Cek apakah user sudah pernah rating produk ini
    const product = await productModel.findById(productId);
    const existing = product.ratings.find((r) => r.user.toString() === userId);

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
  addProduct,
  listProducts,
  updateProduct,
  removeProduct,
  singleProduct,
  getProductsSeller,
  rateProduct,
};
