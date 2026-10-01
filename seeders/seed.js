import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables dari backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import Semua 10 Model Sesuai Schema Backend
import adminModel from "../models/adminModel.js";
import userModel from "../models/userModels.js";
import Seller from "../models/sellerModel.js";
import Mentor from "../models/mentorModel.js";
import categoryModel from "../models/categoryModel.js";
import voucherModel from "../models/voucherModel.js";
import productModel from "../models/productModel.js";
import courseModel from "../models/courseModel.js";
import sliderModel from "../models/sliderModel.js";
import spinWheelModel from "../models/spinWheelModel.js";

const isFresh = process.argv.includes("--fresh");

async function runSeeder() {
  const rawUri = (process.env.MONGODB_URI || "mongodb://localhost:27017").replace(/\/+$/, "");
  const dbName = process.env.DB_NAME || "florera";

  // Pastikan nama database florera masuk ke connection string
  let connectionString = rawUri;
  if (rawUri.includes("?")) {
    const [base, query] = rawUri.split("?");
    const cleanBase = base.endsWith(`/${dbName}`) ? base : `${base}/${dbName}`;
    connectionString = `${cleanBase}?${query}`;
  } else if (!rawUri.endsWith(`/${dbName}`)) {
    connectionString = `${rawUri}/${dbName}`;
  }

  console.log("=========================================");
  console.log("[INFO] Florera Database Seeder (All 10 Models)");
  console.log(`[TARGET DB] Database: ${dbName}`);
  console.log(`[CONNECT] Connecting to: ${connectionString.replace(/:[^:]*@/, ":****@")}`);
  console.log(`[MODE] Mode: ${isFresh ? "FRESH (Wipe and Reseed)" : "IDEMPOTENT (Upsert / Skip Exists)"}`);
  console.log("=========================================\n");

  try {
    await mongoose.connect(connectionString, { dbName });
    console.log(`[SUCCESS] Connected to MongoDB database: '${mongoose.connection.name}'\n`);

    if (isFresh) {
      console.log("[CLEANUP] Wiping existing collections...");
      await Promise.all([
        adminModel.deleteMany({}),
        userModel.deleteMany({}),
        Seller.deleteMany({}),
        Mentor.deleteMany({}),
        categoryModel.deleteMany({}),
        voucherModel.deleteMany({}),
        productModel.deleteMany({}),
        courseModel.deleteMany({}),
        sliderModel.deleteMany({}),
        spinWheelModel.deleteMany({}),
      ]);
      console.log("[SUCCESS] All collections wiped.\n");
    }

    const defaultPassword = "password123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // ==========================================
    // 1. MODEL: adminModel (superadmin, admin, contentmanager, support)
    // ==========================================
    console.log("[SEED] 1/10 Seeding Administrators (adminModel)...");
    const adminData = [
      {
        name: "Florera Super Administrator",
        email: "admin@florera.com",
        password: hashedPassword,
        role: "superadmin",
        isVerifed: true,
        status: "active",
      },
      {
        name: "Florera Operations Staff",
        email: "staff@florera.com",
        password: hashedPassword,
        role: "admin",
        isVerifed: true,
        status: "active",
      },
      {
        name: "Florera Content Creator",
        email: "content@florera.com",
        password: hashedPassword,
        role: "contentmanager",
        isVerifed: true,
        status: "active",
      },
      {
        name: "Florera Support Desk",
        email: "support@florera.com",
        password: hashedPassword,
        role: "support",
        isVerifed: true,
        status: "active",
      },
    ];

    const admins = [];
    for (const item of adminData) {
      let existing = await adminModel.findOne({ email: item.email });
      if (!existing) {
        existing = await adminModel.create(item);
        console.log(`   [+] Created Admin (${item.role}): ${item.email}`);
      } else {
        console.log(`   [SKIP] Admin already exists: ${item.email}`);
      }
      admins.push(existing);
    }
    const primaryAdmin = admins[0];

    // ==========================================
    // 2. MODEL: categoryModel (categories & subcategories)
    // ==========================================
    console.log("\n[SEED] 2/10 Seeding Categories (categoryModel)...");
    const categoryData = [
      {
        name: "Pupuk & Nutrisi",
        subcategories: [
          { name: "Pupuk Organik" },
          { name: "Pupuk Cair" },
          { name: "Booster Pembungaan" },
        ],
        createdBy: primaryAdmin._id,
      },
      {
        name: "Tanaman Hias & Bibit",
        subcategories: [
          { name: "Mawar" },
          { name: "Anggrek" },
          { name: "Bonsai" },
          { name: "Kaktus & Sukulen" },
        ],
        createdBy: primaryAdmin._id,
      },
      {
        name: "Peralatan & Media Tanam",
        subcategories: [
          { name: "Pot Keramik" },
          { name: "Sekop & Gunting Pruning" },
          { name: "Tanah Humus & Cocopeat" },
        ],
        createdBy: primaryAdmin._id,
      },
      {
        name: "Edukasi & Florikultur",
        subcategories: [
          { name: "Kelas Pemula" },
          { name: "Florist Komersial" },
          { name: "Perawatan Khusus" },
        ],
        createdBy: primaryAdmin._id,
      },
    ];

    const categories = [];
    for (const cat of categoryData) {
      let existing = await categoryModel.findOne({ name: cat.name });
      if (!existing) {
        existing = await categoryModel.create(cat);
        console.log(`   [+] Created Category: ${cat.name}`);
      } else {
        console.log(`   [SKIP] Category already exists: ${cat.name}`);
      }
      categories.push(existing);
    }

    // ==========================================
    // 3. MODEL: userModel (Member / Regular User)
    // ==========================================
    console.log("\n[SEED] 3/10 Seeding Users (userModel)...");
    const userData = [
      {
        name: "Clara Agustina",
        email: "member@florera.com",
        phone: "081234567890",
        password: hashedPassword,
        address: "Jl. Kemang Raya No. 12, Jakarta Selatan",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        isVerifed: true,
        role: "user",
        cartData: [],
      },
      {
        name: "Ahmad Pratama",
        email: "ahmad@florera.com",
        phone: "081987654321",
        password: hashedPassword,
        address: "Jl. Dago Asri No. 88, Bandung",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        isVerifed: true,
        role: "user",
        cartData: [],
      },
    ];

    const users = [];
    for (const u of userData) {
      let existing = await userModel.findOne({ email: u.email });
      if (!existing) {
        existing = await userModel.create(u);
        console.log(`   [+] Created User: ${u.email} (${u.name})`);
      } else {
        console.log(`   [SKIP] User already exists: ${u.email}`);
      }
      users.push(existing);
    }
    const sampleUser = users[0];

    // ==========================================
    // 4. MODEL: sellerModel (Reseller / Seller)
    // ==========================================
    console.log("\n[SEED] 4/10 Seeding Sellers (sellerModel)...");
    const sellerData = [
      {
        name: "Bambang Wijaya",
        shopName: "Florera Botanica Store",
        email: "reseller@florera.com",
        password: hashedPassword,
        phone: 81298765432,
        address: "Jl. Agroindustri No. 45, Bandung, Jawa Barat",
        role: "seller",
        isVerifed: true,
        isOfficial: true,
        status: true,
        productCount: 4,
        soldCount: 142,
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        ratings: [
          {
            user: sampleUser._id,
            value: 5,
            comment: "Pelayanan cepat, bibit mawar sampai dalam kondisi segar bugar.",
          },
        ],
      },
      {
        name: "Dewi Lestari",
        shopName: "Nusantara Orchids",
        email: "dewi.seller@florera.com",
        password: hashedPassword,
        phone: 81233445566,
        address: "Jl. Kaliurang Km 10, Sleman, Yogyakarta",
        role: "seller",
        isVerifed: true,
        isOfficial: false,
        status: true,
        productCount: 2,
        soldCount: 56,
        profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        ratings: [
          {
            user: sampleUser._id,
            value: 5,
            comment: "Kualitas pupuk anggrek sangat baik, langsung tampak tunas baru.",
          },
        ],
      },
    ];

    const sellers = [];
    for (const s of sellerData) {
      let existing = await Seller.findOne({ email: s.email });
      if (!existing) {
        existing = await Seller.create(s);
        console.log(`   [+] Created Seller: ${s.email} (${s.shopName})`);
      } else {
        console.log(`   [SKIP] Seller already exists: ${s.email}`);
      }
      sellers.push(existing);
    }
    const primarySeller = sellers[0];

    // ==========================================
    // 5. MODEL: mentorModel (Instructor / Mentor)
    // ==========================================
    console.log("\n[SEED] 5/10 Seeding Mentors (mentorModel)...");
    const mentorData = [
      {
        name: "Dr. Sri Handayani, M.P.",
        email: "mentor@florera.com",
        password: hashedPassword,
        phone: 81345678901,
        address: "Kompleks Riset Hortikultura, Lembang, Bandung",
        bio: "Praktisi dan akademisi florikultur dengan 12 tahun pengalaman membina ratusan florist dan petani hortikultura nasional.",
        socialMedia: new Map([
          ["instagram", "@srihandayani.florist"],
          ["linkedin", "sri-handayani-horti"],
        ]),
        expertise: [
          "Rangkaian Bunga Komersial",
          "Nutrisi Tanaman Hias",
          "Budidaya Anggrek Modern",
        ],
        certificates: [
          "Certified Master Florist (CMF)",
          "Horticultural Educator Award 2023",
        ],
        role: "mentor",
        rating: 4.9,
        ratings: [
          {
            user: sampleUser._id,
            value: 5,
            comment: "Penjelasan materi sangat mudah dipahami pemula.",
          },
        ],
        courseCount: 2,
        studentCount: 310,
        profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        isApprovedByAdmin: "approved",
        isVerifed: true,
        status: true,
      },
      {
        name: "Ir. Hendra Kusuma",
        email: "hendra.mentor@florera.com",
        password: hashedPassword,
        phone: 81377889900,
        address: "Jl. Agrowisata No. 5, Batu, Malang",
        bio: "Spesialis nutrisi tanaman hidroponik dan rekayasa media tanam florikultur dataran rendah.",
        socialMedia: new Map([
          ["instagram", "@hendra.kusuma.agro"],
        ]),
        expertise: ["Nutrisi Hidroponik", "Media Tanam Organik", "Pengendalian Hama"],
        certificates: ["Sertifikasi Ahli Pertanian Organik"],
        role: "mentor",
        rating: 4.8,
        courseCount: 1,
        studentCount: 95,
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        isApprovedByAdmin: "approved",
        isVerifed: true,
        status: true,
      },
    ];

    const mentors = [];
    for (const m of mentorData) {
      let existing = await Mentor.findOne({ email: m.email });
      if (!existing) {
        existing = await Mentor.create(m);
        console.log(`   [+] Created Mentor: ${m.email} (${m.name})`);
      } else {
        console.log(`   [SKIP] Mentor already exists: ${m.email}`);
      }
      mentors.push(existing);
    }
    const primaryMentor = mentors[0];

    // ==========================================
    // 6. MODEL: voucherModel (Vouchers by Admin, Seller, Mentor)
    // ==========================================
    console.log("\n[SEED] 6/10 Seeding Vouchers (voucherModel)...");
    const voucherData = [
      {
        code: "FLORERA10",
        description: "Diskon 10% untuk seluruh transaksi platform Florera",
        discountType: "percent",
        discountValue: 10,
        minPurchase: 50000,
        maxDiscount: 20000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 hari
        usageLimit: 500,
        usedCount: 23,
        createdBy: primaryAdmin._id,
        role: "admin",
        isActive: true,
      },
      {
        code: "BOOSTERHEMAT",
        description: "Potongan langsung Rp 10.000 untuk pembelian produk pupuk",
        discountType: "amount",
        discountValue: 10000,
        minPurchase: 40000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usedCount: 14,
        createdBy: primarySeller._id,
        role: "seller",
        isActive: true,
      },
      {
        code: "KELASFLORIST",
        description: "Potongan 20% untuk pendaftaran kursus merangkai bunga",
        discountType: "percent",
        discountValue: 20,
        minPurchase: 100000,
        maxDiscount: 50000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 50,
        usedCount: 8,
        createdBy: primaryMentor._id,
        role: "mentor",
        isActive: true,
      },
    ];

    const vouchers = [];
    for (const v of voucherData) {
      let existing = await voucherModel.findOne({ code: v.code });
      if (!existing) {
        existing = await voucherModel.create(v);
        console.log(`   [+] Created Voucher: ${v.code} (${v.discountType} ${v.discountValue})`);
      } else {
        console.log(`   [SKIP] Voucher already exists: ${v.code}`);
      }
      vouchers.push(existing);
    }
    const sampleVoucher = vouchers[0];

    // ==========================================
    // 7. MODEL: productModel (Products by Seller)
    // ==========================================
    console.log("\n[SEED] 7/10 Seeding Products (productModel)...");
    const productData = [
      {
        name: "Pupuk Cair Organik Florera Booster 250ml",
        description: "Formula nutrisi esensial organik untuk mempercepat pembungaan mawar dan anggrek.",
        price: 45000,
        discountPrice: 38000,
        category: "Pupuk & Nutrisi",
        stock: 85,
        soldCount: 42,
        rating: 4.8,
        ratings: [
          {
            user: sampleUser._id,
            value: 5,
            comment: "Bunga mawar di kebun mekar lebih cepat dan tahan rontok.",
          },
        ],
        seller: primarySeller._id,
        bestSeller: true,
        voucher: sampleVoucher._id,
        preOrder: false,
        image: [
          "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600",
          "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600",
        ],
        status: "active",
      },
      {
        name: "Bibit Bunga Mawar Merah Hybrid Super",
        description: "Bibit mawar okulasi pilihan dengan kelopak tebal tahan cuaca tropis.",
        price: 32000,
        discountPrice: 28000,
        category: "Tanaman Hias & Bibit",
        stock: 50,
        soldCount: 67,
        rating: 4.9,
        ratings: [
          {
            user: sampleUser._id,
            value: 5,
            comment: "Bibit sampai dalam kondisi daun segar dan akar basah.",
          },
        ],
        seller: primarySeller._id,
        bestSeller: true,
        preOrder: false,
        image: [
          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600",
        ],
        status: "active",
      },
      {
        name: "Pot Keramik Terracotta Rustic Minimalis",
        description: "Pot tanah liat bakar dengan porositas optimal dan sistem drainase ganda.",
        price: 75000,
        discountPrice: 65000,
        category: "Peralatan & Media Tanam",
        stock: 30,
        soldCount: 19,
        rating: 4.7,
        seller: primarySeller._id,
        bestSeller: false,
        preOrder: false,
        image: [
          "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600",
        ],
        status: "active",
      },
      {
        name: "Media Tanam Sekam Fermentasi & Cocopeat 5kg",
        description: "Campuran media tanam steril siap pakai untuk memicu pertumbuhan akar baru.",
        price: 25000,
        discountPrice: 22000,
        category: "Peralatan & Media Tanam",
        stock: 120,
        soldCount: 88,
        rating: 4.9,
        seller: primarySeller._id,
        bestSeller: true,
        preOrder: false,
        image: [
          "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600",
        ],
        status: "active",
      },
    ];

    for (const prod of productData) {
      let existing = await productModel.findOne({ name: prod.name, seller: primarySeller._id });
      if (!existing) {
        await productModel.create(prod);
        console.log(`   [+] Created Product: ${prod.name}`);
      } else {
        console.log(`   [SKIP] Product already exists: ${prod.name}`);
      }
    }

    // ==========================================
    // 8. MODEL: courseModel (Courses, Modules, Lessons, Resources)
    // ==========================================
    console.log("\n[SEED] 8/10 Seeding Courses (courseModel)...");
    const eduCategory = categories.find((c) => c.name.includes("Edukasi")) || categories[0];

    const courseData = [
      {
        title: "Mastering Floristry Art & Commercial Arrangements",
        description: "Pelajari seni merangkai bunga modern mulai dari spiral hand-tied bouquet hingga penetapan harga komersial.",
        mentor: primaryMentor._id,
        price: 249000,
        discountPrice: 199000,
        thumbnail: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800",
        category: eduCategory._id,
        level: "Semua Level",
        duration: "4.5 Jam",
        totalStudents: 184,
        totalModules: 2,
        isActive: true,
        rating: 4.9,
        ratings: [
          {
            user: sampleUser._id,
            value: 5,
            comment: "Sangat detail dan teknik spiral stem dijelaskan dengan jelas.",
          },
        ],
        benefits: [
          "Akses materi seumur hidup",
          "Sertifikat resmi Florera",
          "Komunitas eksklusif florist",
          "Katalog panduan formula pengawet bunga alami",
        ],
        modules: [
          {
            title: "Modul 1: Anatomi Bunga & Conditioning",
            duration: "1.5 Jam",
            description: "Teknik dasar pemotongan dan hidrasi bunga segar.",
            order: 1,
            lessons: [
              {
                title: "1. Pengenalan Alat Florist & Anatomi Tangkai",
                type: "video",
                duration: "20 Menit",
                order: 1,
                isPreview: true,
                thumbnail: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400",
                description: "Pemahaman alat gunting pruning, duri stripper, dan pisau florist.",
                content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              },
              {
                title: "2. Teknik Conditioning Air Dingin & Pemotongan 45 Derajat",
                type: "video",
                duration: "25 Menit",
                order: 2,
                isPreview: false,
                content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              },
            ],
            resources: [
              {
                name: "Checklist Alat Florist Pemula.pdf",
                type: "pdf",
                size: "1.2 MB",
                url: "https://example.com/checklist.pdf",
                description: "Daftar perkakas wajib studio florist.",
              },
            ],
          },
          {
            title: "Modul 2: Teknik Spiral Hand-Tied Bouquet",
            duration: "3 Jam",
            description: "Praktek teknik menyusun buket tangan seimbang.",
            order: 2,
            lessons: [
              {
                title: "3. Teori Roda Warna dan Proporsi Bunga",
                type: "article",
                duration: "15 Menit",
                order: 1,
                isPreview: false,
                content: "Kombinasi warna kontras dan monokromatik dalam merangkai buket premium.",
              },
              {
                title: "4. Praktek Menyusun Spiral Stem Step-by-Step",
                type: "video",
                duration: "45 Menit",
                order: 2,
                isPreview: false,
                content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              },
            ],
            resources: [
              {
                name: "Panduan Roda Warna Florist.pdf",
                type: "pdf",
                size: "2.4 MB",
                url: "https://example.com/color-wheel.pdf",
                description: "Diagram perpaduan warna bunga.",
              },
            ],
          },
        ],
        isPublished: true,
      },
      {
        title: "Nutrisi & Perawatan Anggrek Rumahan",
        description: "Panduan lengkap menjaga anggrek berbunga teratur dengan media arang dan nutrisi seimbang.",
        mentor: primaryMentor._id,
        price: 149000,
        discountPrice: 125000,
        thumbnail: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800",
        category: eduCategory._id,
        level: "Pemula",
        duration: "2.5 Jam",
        totalStudents: 126,
        totalModules: 1,
        isActive: true,
        rating: 4.8,
        benefits: [
          "Jadwal pemupukan terukur",
          "Solusi penyakit busuk daun anggrek",
        ],
        modules: [
          {
            title: "Modul 1: Memahami Kebutuhan Cahaya & Kelembapan",
            duration: "1 Jam",
            description: "Penempatan anggrek di area rumah.",
            order: 1,
            lessons: [
              {
                title: "1. Mengenal Jenis Anggrek Populer (Phalaenopsis & Dendrobium)",
                type: "video",
                duration: "30 Menit",
                order: 1,
                isPreview: true,
                content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              },
            ],
            resources: [],
          },
        ],
        isPublished: true,
      },
    ];

    for (const c of courseData) {
      let existing = await courseModel.findOne({ title: c.title, mentor: primaryMentor._id });
      if (!existing) {
        await courseModel.create(c);
        console.log(`   [+] Created Course: ${c.title}`);
      } else {
        console.log(`   [SKIP] Course already exists: ${c.title}`);
      }
    }

    // ==========================================
    // 9. MODEL: sliderModel (Hero Banner Sliders)
    // ==========================================
    console.log("\n[SEED] 9/10 Seeding Sliders (sliderModel)...");
    const sliderData = [
      {
        image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=1600",
        title: "Solusi Florikultur & Tanaman Hias Terbaik",
        description: "Temukan produk perawatan bunga unggul, media tanam berkualitas, dan bibit tanaman hias langsung dari mitra tani terverifikasi.",
        textBtn1: "Jelajahi Produk",
        linkBtn1: "/all-products",
        textBtn2: "Pelajari Kursus",
        linkBtn2: "/all-courses",
      },
      {
        image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=1600",
        title: "Kembangkan Keahlian Merangkai Bunga Profesional",
        description: "Ikuti kelas eksklusif bersama para mentor florikultur bersertifikat nasional dan bangun bisnis florist impian Anda.",
        textBtn1: "Lihat Kursus",
        linkBtn1: "/all-courses",
        textBtn2: "Tentang Kami",
        linkBtn2: "/about",
      },
    ];

    for (const sl of sliderData) {
      let existing = await sliderModel.findOne({ title: sl.title });
      if (!existing) {
        await sliderModel.create(sl);
        console.log(`   [+] Created Slider: ${sl.title}`);
      } else {
        console.log(`   [SKIP] Slider already exists: ${sl.title}`);
      }
    }

    // ==========================================
    // 10. MODEL: spinWheelModel (Gamification Rewards)
    // ==========================================
    console.log("\n[SEED] 10/10 Seeding SpinWheel (spinWheelModel)...");
    const spinWheelData = {
      title: "Roda Keberuntungan Florera Spesial Musim Semi",
      description: "Putar roda keberuntungan setiap hari untuk memenangkan poin belanja, voucher diskon spesial, dan hadiah menarik lainnya.",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600",
      link: "/spin-wheel",
      isActive: true,
      maxSpinPerUser: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 hari
      prizes: [
        {
          label: "100 Poin Florera",
          value: 100,
          type: "point",
          probability: 40,
          stock: 1000,
        },
        {
          label: "Voucher Diskon 10%",
          value: 10,
          type: "voucher",
          probability: 25,
          stock: 300,
        },
        {
          label: "500 Poin Florera",
          value: 500,
          type: "point",
          probability: 20,
          stock: 200,
        },
        {
          label: "Potongan Rp 15.000",
          value: 15000,
          type: "voucher",
          probability: 10,
          stock: 100,
        },
        {
          label: "Bibit Bunga Gratis",
          value: 30000,
          type: "item",
          probability: 5,
          stock: 20,
        },
      ],
    };

    let existingSpin = await spinWheelModel.findOne({ title: spinWheelData.title });
    if (!existingSpin) {
      await spinWheelModel.create(spinWheelData);
      console.log(`   [+] Created SpinWheel: ${spinWheelData.title} (5 Hadiah)`);
    } else {
      console.log(`   [SKIP] SpinWheel already exists: ${spinWheelData.title}`);
    }

    console.log("\n=========================================");
    console.log("[SUCCESS] ALL 10 MODELS SEEDED SUCCESSFULLY!");
    console.log("=========================================");
    console.log("Daftar Akun Pengujian (Password: password123):");
    console.log("-----------------------------------------");
    console.log("1. Superadmin : admin@florera.com");
    console.log("2. Admin      : staff@florera.com");
    console.log("3. Reseller   : reseller@florera.com");
    console.log("4. Mentor     : mentor@florera.com");
    console.log("5. Member     : member@florera.com");
    console.log("=========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Seeding Error:", error);
    process.exit(1);
  }
}

runSeeder();
