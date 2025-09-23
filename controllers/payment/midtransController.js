import snap from "../../config/payment/midtrans.js";

export const createMidtransTransaction = async (req, res) => {
  try {
    const { orderId, grossAmount, customer } = req.body;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customer.firstName,
        email: customer.email,
        phone: customer.phone,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ success: true, redirect_url: transaction.redirect_url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};