import userModel from "../models/userModels.js";

/**
 * Mendapatkan seluruh isi keranjang user
 */
const getCart = async (req, res) => {
  try {
    const userId = req.userId || req.body?.userId || req.user?.id || req.params?.userId || req.query?.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = Array.isArray(user.cartData) ? user.cartData : [];
    res.status(200).json({ success: true, cart, cartData: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Menambahkan item ke keranjang
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.userId || req.body?.userId;
    const { productId, quantity = 1, size, type = "product" } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!Array.isArray(user.cartData)) {
      user.cartData = [];
    }

    const parsedQty = Math.max(1, parseInt(quantity) || 1);

    // Cek apakah produk dengan ID dan size/type sama sudah ada
    const existingIndex = user.cartData.findIndex(
      (item) =>
        item.productId?.toString() === productId.toString() &&
        (item.size || null) === (size || null) &&
        (item.type || "product") === (type || "product")
    );

    if (existingIndex > -1) {
      user.cartData[existingIndex].quantity += parsedQty;
    } else {
      user.cartData.push({
        productId,
        quantity: parsedQty,
        size: size || null,
        type: type || "product",
      });
    }

    user.markModified("cartData");
    await user.save();

    res.status(200).json({
      success: true,
      message: "Added to cart",
      cart: user.cartData,
      cartData: user.cartData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Memperbarui jumlah item tertentu di keranjang
 */
const updateCartItem = async (req, res) => {
  try {
    const userId = req.userId || req.body?.userId;
    const { productId, quantity, size, type = "product" } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!Array.isArray(user.cartData)) {
      user.cartData = [];
    }

    const targetQty = parseInt(quantity);

    if (isNaN(targetQty) || targetQty <= 0) {
      // Jika quantity 0 atau negatif, hapus item dari cart
      user.cartData = user.cartData.filter(
        (item) =>
          !(
            item.productId?.toString() === productId.toString() &&
            (item.size || null) === (size || null) &&
            (item.type || "product") === (type || "product")
          )
      );
    } else {
      const existingIndex = user.cartData.findIndex(
        (item) =>
          item.productId?.toString() === productId.toString() &&
          (item.size || null) === (size || null) &&
          (item.type || "product") === (type || "product")
      );

      if (existingIndex > -1) {
        user.cartData[existingIndex].quantity = targetQty;
      } else {
        user.cartData.push({
          productId,
          quantity: targetQty,
          size: size || null,
          type: type || "product",
        });
      }
    }

    user.markModified("cartData");
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: user.cartData,
      cartData: user.cartData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Menghapus item dari keranjang
 */
const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId || req.body?.userId;
    const { productId, size, type } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (Array.isArray(user.cartData)) {
      user.cartData = user.cartData.filter((item) => {
        const matchesProduct = item.productId?.toString() === productId.toString();
        const matchesSize = size ? item.size === size : true;
        const matchesType = type ? (item.type || "product") === type : true;
        return !(matchesProduct && matchesSize && matchesType);
      });

      user.markModified("cartData");
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: user.cartData || [],
      cartData: user.cartData || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mengosongkan keranjang user
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.userId || req.body?.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.cartData = [];
    user.markModified("cartData");
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: [],
      cartData: [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addToCart, getCart, removeFromCart, clearCart, updateCartItem };
