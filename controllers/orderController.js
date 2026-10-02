import orderModel from "../models/orderModel.js";
import userModel from "../models/userModels.js";

// Place a new order
export const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      amount,
      address,
      paymentMethod,
      paymentDetails,
      paymentProof,
      sellerId,
      storeName,
    } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User ID and items are required",
      });
    }

    if (!paymentProof || typeof paymentProof !== "string" || paymentProof.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Bukti transfer / pembayaran wajib diunggah.",
      });
    }

    const orderNumber = `ORD-${Date.now()}`;

    const newOrder = new orderModel({
      userId,
      orderNumber,
      items,
      amount,
      address: address || {},
      paymentMethod: paymentMethod || "Transfer Bank",
      paymentDetails: paymentDetails || {},
      paymentProof: paymentProof || "",
      sellerId: sellerId || "",
      storeName: storeName || "",
      status: "pending",
      date: new Date(),
    });

    const savedOrder = await newOrder.save();

    // If order contains courses, also push course IDs to user's purchasedCourses
    const courseItems = items.filter((it) => it.type === "course");
    if (courseItems.length > 0) {
      try {
        const user = await userModel.findById(userId);
        if (user) {
          if (!user.purchasedCourses) user.purchasedCourses = [];
          courseItems.forEach((c) => {
            if (!user.purchasedCourses.includes(c._id)) {
              user.purchasedCourses.push(c._id);
            }
          });
          await user.save();
        }
      } catch (err) {
        console.warn("Could not attach course to user model:", err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: savedOrder._id,
      orderNumber: savedOrder.orderNumber,
      order: savedOrder,
    });
  } catch (error) {
    console.error("placeOrder error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get orders by user ID
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId || req.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const orders = await orderModel
      .find({
        $or: [{ userId: userId }, { userId: String(userId) }],
      })
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("getUserOrders error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    const order = await orderModel.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderNumber: orderId }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    // If status became success, ensure purchasedCourses are enrolled
    if (status === "success" || status === "completed") {
      const courseItems = (order.items || []).filter((it) => it.type === "course");
      if (courseItems.length > 0 && order.userId) {
        try {
          const user = await userModel.findById(order.userId);
          if (user) {
            if (!user.purchasedCourses) user.purchasedCourses = [];
            courseItems.forEach((c) => {
              if (!user.purchasedCourses.includes(c._id)) {
                user.purchasedCourses.push(c._id);
              }
            });
            await user.save();
          }
        } catch (e) {}
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get orders for a specific seller
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.body.sellerId || req.query.sellerId || req.sellerId;
    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    const orders = await orderModel
      .find({
        $or: [
          { sellerId: sellerId },
          { sellerId: String(sellerId) },
          { "items.seller": sellerId },
          { "items.seller": String(sellerId) }
        ],
      })
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("getSellerOrders error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload or update payment proof for an order
export const uploadPaymentProof = async (req, res) => {
  try {
    const { orderId, paymentProof } = req.body;
    if (!orderId || !paymentProof) {
      return res.status(400).json({
        success: false,
        message: "Order ID and paymentProof are required",
      });
    }

    const order = await orderModel.findOne({
      $or: [
        { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
        { orderNumber: orderId },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentProof = paymentProof;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Bukti pembayaran berhasil diunggah",
      order,
    });
  } catch (error) {
    console.error("uploadPaymentProof error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

