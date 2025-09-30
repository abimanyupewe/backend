import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const client = new Client();

// bisa diaktifkan jika ingin pake QR code
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp client is ready!");
});

client.initialize();

export const sendOTPWhatsApp = async (name, phone, otp) => {
  // Format nomor: harus pakai kode negara, contoh: "6281234567890"
  const chatId = phone.replace(/^0/, "62") + "@c.us";
  const message = `Hallo ${name}, Kode OTP Florera Anda: ${otp}\nJangan bagikan kode ini ke siapa pun.`;

  try {
    await client.sendMessage(chatId, message);
    console.log("OTP WhatsApp sent!");
  } catch (error) {
    console.error("Failed to send WhatsApp OTP:", error);
  }
};

export const sendVerifiedWhatsApp = async (name, phone) => {
  const chatId = phone.replace(/^0/, "62") + "@c.us";
  const message = `Selamat ${name}! Akun Florera Anda sudah terverifikasi dan siap digunakan.`;

  try {
    await client.sendMessage(chatId, message);
    console.log("Verifikasi WhatsApp sent!");
  } catch (error) {
    console.error("Failed to send WhatsApp verification message:", error);
  }
};
