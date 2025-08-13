import { v2 as cloudinary } from "cloudinary";

// connect cloudinary dengan debug
const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });
  // Debug log
  console.log("[Cloudinary] Konfigurasi:", {
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    // Jangan log api_secret demi keamanan
  });
  // Ping Cloudinary untuk cek koneksi
  cloudinary.api
    .ping()
    .then((result) => console.log("[Cloudinary] Ping sukses:", result))
    .catch((err) => console.error("[Cloudinary] Ping gagal:", err.message));
};

export default connectCloudinary;
