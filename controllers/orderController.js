import orderModel from "../models/orderModel.js";
import userModel from "../models/userModels.js";

// Place Order
export const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod } = req.body;
    const userId = req.body.userId;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod,
      status: "pending",
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    res.json({ success: true, message: "Order Placed", orderId: newOrder._id });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update order status (simulate webhook)
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });

    // If success, add courses to user
    if (status === "success") {
      const order = await orderModel.findById(orderId);
      const courses = order.items.filter((item) => item.type === "course").map(c => c._id);
      if (courses.length > 0) {
        await userModel.findByIdAndUpdate(order.userId, {
          $addToSet: { purchasedCourses: { $each: courses } }
        });
      }
      
      // Clear cart
      await userModel.findByIdAndUpdate(order.userId, { cartData: [] });
    }

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Orders
export const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId }).sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
