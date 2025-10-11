import sgMail from "@sendgrid/mail";
import { verEmailTemplate } from "../templates/EmailTemplate.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOTPCode = async (email, otp) => {
  try {
    await sgMail.send({
      to: email,
      from: 'By Florera <floreratip3@gmail.com>',
      subject: "Kode Verifikasi Registrasi Akun Florera",
      text: `Kode OTP Anda`,
      html: verEmailTemplate.replace("{otp}", otp),
    });
    console.log("Email sent to:", email);
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    throw error;
  }
};
