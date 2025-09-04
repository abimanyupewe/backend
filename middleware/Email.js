import { transporter } from "../config/emailConfig.js";
import { verEmailTemplate } from "../templates/EmailTemplate.js";

export const sendOTPCode = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: '"By Florera" <floreratip3@gmail.com>',
            to: email,
            subject: "Kode Verifikasi Registrasi Akun Florera",
            text: `Kode Anda`,
            html: verEmailTemplate.replace("{otp}", otp),
        });

        console.log(info);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
