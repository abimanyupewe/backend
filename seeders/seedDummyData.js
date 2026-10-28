import mongoose from "mongoose";
import "dotenv/config.js";
import blogModel from "../models/blogModel.js";
import teamModel from "../models/teamModel.js";
import documentationModel from "../models/documentationModel.js";

const blogs = [
  {
    title: "5 Tips Merawat Tanaman Hias untuk Pemula",
    date: new Date("2023-12-01"),
    relase: "2 minutes ago",
    author: {
      name: "Yola Pratika",
      about: "CEO - Florera",
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200",
    },
    excerpt: "Tips merawat tanaman hias untuk pemula yang mudah dilakukan di rumah.",
    category: "Tanaman Hias",
    tags: ["tanaman", "hias", "perawatan", "rumah", "pemula"],
    slug: "tips-merawat-tanaman-hias",
    coverImage: "https://images.unsplash.com/photo-1416879598555-220d91d843da?auto=format&fit=crop&q=80",
    seo: {
      metaTitle: "5 Tips Merawat Tanaman Hias untuk Pemula",
      metaDescription: "Pelajari 5 tips mudah merawat tanaman hias agar tumbuh subur dan sehat.",
      keywords: ["tanaman hias", "perawatan tanaman hias"],
    },
    content: [
      {
        tip: 1,
        title: "Pilih Tanaman yang Sesuai dengan Lingkungan",
        description: "Pastikan Anda memilih tanaman hias yang sesuai dengan kondisi cahaya dan suhu di rumah Anda. Tanaman seperti kaktus dan sukulen cocok untuk ruangan terang dan kering.",
        images: [],
      },
      {
        tip: 2,
        title: "Siram Tanaman dengan Air Secukupnya",
        description: "Jangan terlalu sering atau terlalu jarang menyiram tanaman. Cek tingkat kelembaban tanah terlebih dahulu.",
        images: [],
      }
    ],
    comments: [
      {
        name: "Siti Nurhaliza",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200",
        date: new Date("2023-12-01T14:30:00Z"),
        comment: "Tipsnya sangat membantu, tanaman saya jadi tumbuh lebih subur!",
        likes: 15,
      }
    ],
    relatedPosts: []
  },
  {
    title: "Panduan Lengkap Cara Memupuk Tanaman dengan Pupuk Organik",
    date: new Date("2024-01-15"),
    relase: "1 week ago",
    author: {
      name: "Yola Pratika",
      about: "CEO - Florera",
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200",
    },
    excerpt: "Teknik memupuk tanaman menggunakan pupuk organik untuk hasil maksimal.",
    category: "Pupuk & Nutrisi",
    tags: ["pupuk", "organik", "nutrisi"],
    slug: "panduan-memupuk-tanaman-pupuk-organik",
    coverImage: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e736?auto=format&fit=crop&q=80",
    seo: {
      metaTitle: "Panduan Lengkap Memupuk Tanaman dengan Pupuk Organik",
      metaDescription: "Pelajari cara tepat memupuk tanaman menggunakan pupuk organik.",
      keywords: ["pupuk organik", "cara memupuk"],
    },
    content: [
      {
        tip: 1,
        title: "Kenali Jenis-Jenis Pupuk Organik",
        description: "Pupuk organik terdiri dari berbagai jenis seperti kompos, pupuk kandang, dan pupuk cair organik. Kompos kaya akan bahan organik dan baik untuk struktur tanah.",
        images: [],
      }
    ],
    comments: [],
    relatedPosts: []
  }
];

const teams = [
  {
    name: "Emmanuel Kent Amadeo",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200",
    division: "Keuangan",
    description: "Mengelola keuangan, anggaran, dan laporan keuangan",
  },
  {
    name: "Yola Pratika",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200",
    division: "CEO",
    description: "Memimpin strategi perusahaan, pengambilan keputusan, dan hubungan investor",
  },
  {
    name: "Abimanyu Priyo Widagdo",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
    division: "Teknologi",
    description: "Mengembangkan dan memelihara platform Florera",
  },
  {
    name: "Mario Yudha Pratama",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200",
    division: "Pemasaran",
    description: "Merancang strategi pemasaran dan kampanye branding",
  },
  {
    name: "Ahmad Fadlillah",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    division: "Komunikasi",
    description: "Membangun dan mengelola komunitas pengguna serta program engagement",
  }
];

const documentations = [
  {
    title: "Workshop Urban Gardening",
    date: "15 Mei 2023",
    description: "Pelatihan berkebun di lahan terbatas untuk pemula",
    category: "Workshop",
    coverImage: "https://images.unsplash.com/photo-1416879598555-220d91d843da?auto=format&fit=crop&q=80",
    photos: [
      { image: "https://images.unsplash.com/photo-1416879598555-220d91d843da?auto=format&fit=crop&q=80", caption: "Peserta workshop sedang praktik" },
      { image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e736?auto=format&fit=crop&q=80", caption: "Instruktur menjelaskan materi" },
    ]
  },
  {
    title: "Panen Pertama Komunitas",
    date: "2 Juli 2023",
    description: "Kegiatan panen bersama hasil kebun komunitas Florera",
    category: "Kegiatan",
    coverImage: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e736?auto=format&fit=crop&q=80",
    photos: [
      { image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e736?auto=format&fit=crop&q=80", caption: "Panen sayuran organik" },
      { image: "https://images.unsplash.com/photo-1416879598555-220d91d843da?auto=format&fit=crop&q=80", caption: "Anggota komunitas berfoto bersama" },
    ]
  }
];

const seedDummyData = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    console.log("Database connected successfully.");

    console.log("Clearing existing dummy models...");
    await blogModel.deleteMany({});
    await teamModel.deleteMany({});
    await documentationModel.deleteMany({});

    console.log("Seeding Blogs...");
    await blogModel.insertMany(blogs);
    
    console.log("Seeding Teams...");
    await teamModel.insertMany(teams);
    
    console.log("Seeding Documentations...");
    await documentationModel.insertMany(documentations);

    console.log("Seeding dummy data completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedDummyData();
