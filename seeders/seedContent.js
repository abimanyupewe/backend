import mongoose from "mongoose";
import "dotenv/config";
import contentModel from "../models/contentModel.js";

const seedDatabase = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    console.log("Database connected successfully.");

    console.log("Clearing existing content...");
    await contentModel.deleteMany({});

    console.log("Seeding homepage content...");
    await contentModel.create({
      type: "homepage",
      topBanner: {
        isActive: true,
        text: "Promo Spesial Hari Raya! Diskon hingga 50% untuk semua tanaman hias.",
        link: "/store",
        backgroundColor: "#152A20",
        textColor: "#ffffff",
      },
      heroSliders: [
        {
          image: "https://images.unsplash.com/photo-1416879598555-220d91d843da?auto=format&fit=crop&q=80",
          title: "Hijaukan Ruangan Anda",
          subtitle: "Temukan koleksi tanaman hias terbaik untuk mempercantik rumah dan ruang kerja Anda.",
          buttonText: "Belanja Sekarang",
          buttonLink: "/store",
          isActive: true,
        },
        {
          image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e736?auto=format&fit=crop&q=80",
          title: "Belajar Merawat Tanaman",
          subtitle: "Ikuti kelas dari para mentor ahli kami dan jadilah ahli berkebun di rumah sendiri.",
          buttonText: "Lihat Kursus",
          buttonLink: "/courses",
          isActive: true,
        }
      ],
      faqs: [
        {
          question: "Bagaimana cara merawat tanaman indoor?",
          answer: "Setiap tanaman memiliki kebutuhan cahaya dan air yang berbeda. Secara umum, pastikan media tanam tidak terlalu basah dan letakkan di tempat yang terang namun tidak terkena matahari langsung.",
          isActive: true,
        },
        {
          question: "Apakah pengiriman tanaman aman?",
          answer: "Sangat aman. Seller kami mempacking tanaman dengan teknik khusus yang menjaga kelembaban akar dan meminimalkan kerusakan daun selama perjalanan.",
          isActive: true,
        },
        {
          question: "Apakah bisa konsultasi dengan mentor?",
          answer: "Tentu! Anda bisa membeli sesi kursus atau mentoring eksklusif dengan para ahli kami untuk memandu Anda langkah demi langkah.",
          isActive: true,
        }
      ]
    });

    console.log("Seed content completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();
