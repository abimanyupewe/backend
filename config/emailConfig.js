import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "floreratip3@gmail.com",
    pass: process.env.APP_PASS,
  },
});

// const sendEmail = async () => {
//   try {
//     const info = await transporter.sendMail({
//       from: '"By Florera" <floreratip3@gmail.com>',
//       to: "abimanyupw369@gmail.com",
//       subject: "Hello ✔",
//       text: "Hello world?", // plain‑text body
//       html: "<b>Hello world?</b>", // HTML body
//     });

//     console.log(info);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// };

export { transporter };
