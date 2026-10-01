import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables dari backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import {
  AgencyProduct,
  AgencyEvent,
  AgencyService,
  AgencyTeam,
  AgencyTestimonial,
  AgencyFaq,
  AgencyOrder,
} from "../models/agencyModel.js";

const isFresh = process.argv.includes("--fresh");

async function runAgencySeeder() {
  const rawUri = (process.env.MONGODB_URI || "mongodb://localhost:27017").replace(/\/+$/, "");
  const dbName = process.env.DB_NAME || "florera";

  let connectionString = rawUri;
  if (rawUri.includes("?")) {
    const [base, query] = rawUri.split("?");
    const cleanBase = base.endsWith(`/${dbName}`) ? base : `${base}/${dbName}`;
    connectionString = `${cleanBase}?${query}`;
  } else if (!rawUri.endsWith(`/${dbName}`)) {
    connectionString = `${rawUri}/${dbName}`;
  }

  console.log("=========================================");
  console.log("[INFO] Florera Agency Dedicated Seeder");
  console.log(`[TARGET DB] Database: ${dbName}`);
  console.log(`[CONNECT] Connecting to: ${connectionString.replace(/:[^:]*@/, ":****@")}`);
  console.log(`[MODE] Mode: ${isFresh ? "FRESH (Wipe Agency Collections and Reseed)" : "IDEMPOTENT (Skip if exists)"}`);
  console.log("=========================================\n");

  try {
    await mongoose.connect(connectionString, { dbName });
    console.log(`[SUCCESS] Connected to MongoDB database: '${mongoose.connection.name}'\n`);

    if (isFresh) {
      console.log("[CLEANUP] Wiping existing Agency collections...");
      await Promise.all([
        AgencyProduct.deleteMany({}),
        AgencyEvent.deleteMany({}),
        AgencyService.deleteMany({}),
        AgencyTeam.deleteMany({}),
        AgencyTestimonial.deleteMany({}),
        AgencyFaq.deleteMany({}),
        AgencyOrder.deleteMany({}),
      ]);
      console.log("[SUCCESS] Agency collections wiped.\n");
    }

    // ==========================================
    // 1. AGENCY PRODUCTS
    // ==========================================
    console.log("[SEED] 1/7 Seeding Agency Products...");
    const products = [
      {
        name: "Florera Signature Botanical Arrangement",
        slug: "signature-botanical-arrangement",
        description: "Rangkaian bunga segar berstandar internasional untuk kebutuhan instalasi interior korporat dan perhotelan mewah.",
        price: 850000,
        stock: 25,
        category: "Corporate Installation",
        image_url: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600",
        is_active: true,
      },
      {
        name: "Monstera Deliciosa Variegata Albo",
        slug: "monstera-deliciosa-variegata",
        description: "Spesimen tanaman botani langka dengan pola variegata putih stabil, dirawat di greenhouse steril Florera.",
        price: 2500000,
        stock: 5,
        category: "Exotic Collector",
        image_url: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600",
        is_active: true,
      },
      {
        name: "Ficus Lyrata Fiddle Leaf Fig Premium",
        slug: "ficus-lyrata-fiddle-leaf",
        description: "Tanaman indoor berukuran 1.8 meter dengan kanopi lebat dan pot teraso arsitektural minimalis.",
        price: 1200000,
        stock: 12,
        category: "Architectural Plants",
        image_url: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=600",
        is_active: true,
      },
      {
        name: "Organic Liquid Bio-Nutrient 1L Bulk",
        slug: "organic-liquid-bio-nutrient-1l",
        description: "Formula nutrisi mikro konsentrat untuk proyek lansekap komersial dan perawatan taman gedung perkantoran.",
        price: 175000,
        stock: 150,
        category: "Professional Nutrients",
        image_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600",
        is_active: true,
      },
    ];

    for (const p of products) {
      let existing = await AgencyProduct.findOne({ name: p.name });
      if (!existing) {
        await AgencyProduct.create(p);
        console.log(`   [+] Created Agency Product: ${p.name}`);
      } else {
        console.log(`   [SKIP] Agency Product exists: ${p.name}`);
      }
    }

    // ==========================================
    // 2. AGENCY EVENTS
    // ==========================================
    console.log("\n[SEED] 2/7 Seeding Agency Events...");
    const events = [
      {
        title: "Florera Botanical Design Expo 2026",
        slug: "florera-botanical-design-expo-2026",
        description: "Pameran desain lansekap florikultur modern dan temu bisnis mitra pengembang properti ramah lingkungan.",
        event_date: new Date("2026-11-15T09:00:00Z"),
        location: "Grand Ballroom Indonesia Convention Exhibition (ICE BSD)",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600",
        is_active: true,
      },
      {
        title: "Exclusive Floristry Masterclass: Japanese Ikebana & Contemporary European",
        slug: "exclusive-floristry-masterclass-ikebana",
        description: "Workshop intensif teknik merangkai bunga modern bersama para kurator florikultur terkemuka.",
        event_date: new Date("2026-12-05T13:00:00Z"),
        location: "Florera Creative Greenhouse, Lembang, Bandung",
        image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600",
        is_active: true,
      },
    ];

    for (const ev of events) {
      let existing = await AgencyEvent.findOne({ slug: ev.slug });
      if (!existing) {
        await AgencyEvent.create(ev);
        console.log(`   [+] Created Agency Event: ${ev.title}`);
      } else {
        console.log(`   [SKIP] Agency Event exists: ${ev.title}`);
      }
    }

    // ==========================================
    // 3. AGENCY SERVICES
    // ==========================================
    console.log("\n[SEED] 3/7 Seeding Agency Services...");
    const services = [
      {
        name: "Corporate Interior Biophilic Styling",
        slug: "corporate-interior-biophilic-styling",
        description: "Layanan perancangan dan instalasi tanaman hias indoor terintegrasi untuk kantor modern dan perhotelan bintang 5.",
        price: 15000000,
        is_active: true,
      },
      {
        name: "Luxury Wedding & Gala Floral Direction",
        slug: "luxury-wedding-gala-floral-direction",
        description: "Arahan artistik dan instalasi bunga lengkap untuk pernikahan mewah, resepsi privat, dan perhelatan gala kenegaraan.",
        price: 45000000,
        is_active: true,
      },
      {
        name: "Commercial Landscape & Green Maintenance",
        slug: "commercial-landscape-green-maintenance",
        description: "Pemeliharaan rutin lanskap taman perkantoran dengan monitoring kesehatan nutrisi tanah dan pemangkasan artistik.",
        price: 7500000,
        is_active: true,
      },
    ];

    for (const s of services) {
      let existing = await AgencyService.findOne({ slug: s.slug });
      if (!existing) {
        await AgencyService.create(s);
        console.log(`   [+] Created Agency Service: ${s.name}`);
      } else {
        console.log(`   [SKIP] Agency Service exists: ${s.name}`);
      }
    }

    // ==========================================
    // 4. AGENCY TEAM MEMBERS
    // ==========================================
    console.log("\n[SEED] 4/7 Seeding Agency Team...");
    const team = [
      {
        name: "Arya Daniswara",
        position: "Chief Executive & Creative Director",
        bio: "Arsitek lansekap lulusan TU Delft dengan pengalaman 15 tahun dalam perancangan biophilic design berskala internasional.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        is_active: true,
      },
      {
        name: "Karin Novita, S.Sn.",
        position: "Head of Floral Architecture",
        bio: "Master florist bersertifikat dengan karya instalasi bunga di berbagai pameran seni kontemporer dan gala internasional.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        is_active: true,
      },
      {
        name: "Bayu Wicaksana",
        position: "Lead Horticultural Agronomist",
        bio: "Peneliti nutrisi tanaman yang mengawasi formula pupuk organik dan stabilitas media tanam Florera.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        is_active: true,
      },
    ];

    for (const tm of team) {
      let existing = await AgencyTeam.findOne({ name: tm.name });
      if (!existing) {
        await AgencyTeam.create(tm);
        console.log(`   [+] Created Agency Team Member: ${tm.name} (${tm.position})`);
      } else {
        console.log(`   [SKIP] Agency Team Member exists: ${tm.name}`);
      }
    }

    // ==========================================
    // 5. AGENCY TESTIMONIALS
    // ==========================================
    console.log("\n[SEED] 5/7 Seeding Agency Testimonials...");
    const testimonials = [
      {
        client_name: "Jonathan Mahendra",
        company_name: "The Langham Hotel Jakarta",
        content: "Instalasi florikultur Florera di area lobby dan suite kami meningkatkan impresi visual para tamu VIP. Kesegaran bunga dan konsistensi perawatannya luar biasa profesional.",
        rating: 5,
        is_published: true,
      },
      {
        client_name: "Siti Rahmawati",
        company_name: "GoTo Campus HQ",
        content: "Konsep biophilic work environment yang dirancang Florera Agency terbukti meningkatkan kenyamanan dan produktivitas tim kami secara signifikan.",
        rating: 5,
        is_published: true,
      },
      {
        client_name: "Michael Chen",
        company_name: "Artisan Wedding Organizer",
        content: "Florera selalu menjadi partner andalan kami untuk instalasi grand floral decor. Presisi desain dan pemilihan warnanya tidak pernah mengecewakan klien.",
        rating: 5,
        is_published: true,
      },
    ];

    for (const t of testimonials) {
      let existing = await AgencyTestimonial.findOne({ client_name: t.client_name });
      if (!existing) {
        await AgencyTestimonial.create(t);
        console.log(`   [+] Created Agency Testimonial: ${t.client_name} (${t.company_name})`);
      } else {
        console.log(`   [SKIP] Agency Testimonial exists: ${t.client_name}`);
      }
    }

    // ==========================================
    // 6. AGENCY FAQS
    // ==========================================
    console.log("\n[SEED] 6/7 Seeding Agency FAQs...");
    const faqs = [
      {
        question: "Berapa lama waktu yang dibutuhkan untuk survei dan konsultasi desain instalasi?",
        answer: "Tim arsitek botani Florera menjadwalkan survei lokasi dalam waktu 24-48 jam setelah pemesanan layanan. Rancangan proposal 3D dan skema florikultur diserahkan dalam 3 hari kerja.",
        sort_order: 1,
        is_active: true,
      },
      {
        question: "Apakah Florera Agency menyediakan garansi penggantian tanaman yang layu?",
        answer: "Ya, setiap kontrak pemeliharaan berkala (maintenance service) menyertakan garansi penggantian tanaman hidup 100% tanpa biaya tambahan apabila terjadi penurunan kesegaran.",
        sort_order: 2,
        is_active: true,
      },
      {
        question: "Bagaimana sistem pemesanan katalog botani untuk pengiriman luar kota?",
        answer: "Pengiriman spesimen botani premium luar kota dikemas menggunakan palet kayu isolasi termal khusus untuk menjaga kelembapan akar dan integritas daun selama proses logistik.",
        sort_order: 3,
        is_active: true,
      },
    ];

    for (const f of faqs) {
      let existing = await AgencyFaq.findOne({ question: f.question });
      if (!existing) {
        await AgencyFaq.create(f);
        console.log(`   [+] Created Agency FAQ: ${f.question.slice(0, 45)}...`);
      } else {
        console.log(`   [SKIP] Agency FAQ exists: ${f.question.slice(0, 45)}...`);
      }
    }

    // ==========================================
    // 7. AGENCY ORDERS
    // ==========================================
    console.log("\n[SEED] 7/7 Seeding Agency Orders...");
    const orders = [
      {
        invoice_number: "INV-AGC-20261001-001",
        client_name: "PT Nusantara Properti Hijau",
        client_email: "finance@nusantaraproperti.co.id",
        total_price: 35000000,
        status: "Completed",
        order_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        invoice_number: "INV-AGC-20261001-002",
        client_name: "The Ritz-Carlton Bali Lounge",
        client_email: "procurement@ritzcarltonbali.com",
        total_price: 22500000,
        status: "Paid",
        order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        invoice_number: "INV-AGC-20261001-003",
        client_name: "Studio Arsitektur Senopati",
        client_email: "contact@senopatistudio.id",
        total_price: 8500000,
        status: "Pending",
        order_date: new Date(),
      },
    ];

    for (const o of orders) {
      let existing = await AgencyOrder.findOne({ invoice_number: o.invoice_number });
      if (!existing) {
        await AgencyOrder.create(o);
        console.log(`   [+] Created Agency Order: ${o.invoice_number} (Rp ${o.total_price.toLocaleString("id-ID")})`);
      } else {
        console.log(`   [SKIP] Agency Order exists: ${o.invoice_number}`);
      }
    }

    console.log("\n=========================================");
    console.log("[SUCCESS] AGENCY SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("[ERROR] Agency Seeding Error:", error);
    process.exit(1);
  }
}

runAgencySeeder();
