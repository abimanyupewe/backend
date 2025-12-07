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

export const sendResetPasswordEmail = async (email, otp) => {
  try {
    await sgMail.send({
      to: email,
      from: 'By Florera <floreratip3@gmail.com>',
      subject: "Reset Password - Florera Admin",
      text: `Gunakan kode OTP berikut untuk mereset password Anda: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Password</h2>
          <p>Anda telah meminta untuk mereset password akun admin Florera Anda.</p>
          <p>Gunakan kode OTP berikut untuk melanjutkan proses:</p>
          <h1 style="color: #2e8656; letter-spacing: 5px;">${otp}</h1>
          <p>Kode ini akan kadaluarsa dalam 5 menit.</p>
          <p>Jika Anda tidak meminta ini, abaikan email ini.</p>
        </div>
      `,
    });
    console.log("Reset password email sent to:", email);
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    throw error;
  }
};
