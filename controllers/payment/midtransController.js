import snap from "../../config/payment/midtrans.js";

export const createMidtransTransaction = async (req, res) => {
  try {
    const { orderId, grossAmount, customer } = req.body;

    if (!orderId || !grossAmount) {
      return res.status(400).json({
        success: false,
        message: "orderId and grossAmount are required",
      });
    }

    const parameter = {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: Math.round(Number(grossAmount)),
      },
      customer_details: {
        first_name: customer?.firstName || "Pelanggan",
        last_name: customer?.lastName || "",
        email: customer?.email || "customer@florera.com",
        phone: customer?.phone || "081234567890",
      },
    };

    const transaction = await snap.createTransaction(parameter);
    return res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
  } catch (error) {
    console.error("Midtrans transaction error:", error.message);
    const isAuthError =
      error.message?.includes("401") ||
      error.message?.includes("Unauthorized") ||
      error.httpStatusCode === "401";

    return res.status(isAuthError ? 401 : 500).json({
      success: false,
      isUnauthorized: isAuthError,
      message: isAuthError
        ? "Midtrans API Unauthorized (401). MIDTRANS_SERVER_KEY di backend/.env tidak valid atau sudah kedaluwarsa di Midtrans Dashboard."
        : error.message,
      hint: isAuthError
        ? "Buka Dashboard Midtrans Sandbox -> Settings -> Access Keys -> Salin Server Key yang aktif ke backend/.env."
        : undefined,
    });
  }
};