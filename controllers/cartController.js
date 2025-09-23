import userModel from "../models/userModels";

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Cek apakah produk sudah ada di cart
    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );
    await user.save();
    res.status(200).json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {};

const updateCartItem = async (req, res) => {};

export { addToCart, getCart, removeFromCart, clearCart, updateCartItem };
