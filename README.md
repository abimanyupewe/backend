# Florera API Backend

Ini adalah layanan backend untuk aplikasi Florera. Proyek ini menyediakan REST API untuk aplikasi utama Florera, Dasbor Admin Penjual, Dasbor Admin Mentor, dan Dasbor Admin Utama (All-in-One). Backend ini dibangun menggunakan Node.js dan Express.js, serta terhubung ke basis data MongoDB.

## Teknologi yang Digunakan

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JSON Web Tokens](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=JSON%20web%20tokens&logoColor=white)

*   **Runtime:** Node.js
*   **Kerangka Kerja (Framework):** Express.js
*   **Basis Data:** MongoDB
*   **ODM:** Mongoose
*   **Autentikasi:** JSON Web Token (JWT), bcrypt
*   **Penyimpanan Media:** Cloudinary, Multer
*   **Gerbang Pembayaran (Payment Gateway):** Midtrans Client
*   **Layanan Email:** Nodemailer, SendGrid
*   **Pesan API:** WhatsApp Web JS
*   **Validasi Data:** Validator

## Fitur Utama

*   **Kontrol Akses Berbasis Peran:** Rute API dan lapisan autentikasi yang terpisah untuk Admin, Pengguna (User), Penjual (Seller), dan Mentor.
*   **Autentikasi dan Otorisasi:** Sistem masuk (login) dan pendaftaran yang aman menggunakan JWT, disertai dengan verifikasi OTP untuk aktivasi akun.
*   **Manajemen Produk dan Kursus:** Endpoint untuk menangani operasi CRUD pada produk (untuk penjual) dan kursus (untuk mentor), termasuk unggahan gambar melalui Cloudinary.
*   **Keranjang Belanja dan Pembayaran:** Fungsionalitas keranjang belanja dan pemrosesan pembayaran yang terintegrasi dengan Midtrans.
*   **Tugas Pembersihan Otomatis:** Proses latar belakang yang berjalan setiap menit untuk menghapus akun yang tidak terverifikasi setelah OTP kedaluwarsa.
*   **Konfigurasi CORS:** Pengaturan Cross-Origin Resource Sharing (CORS) dinamis yang mendukung berbagai lingkungan frontend.

## Memulai Proyek

Ikuti petunjuk di bawah ini untuk mengatur proyek di komputer lokal Anda untuk keperluan pengembangan dan pengujian.

### Prasyarat

*   Node.js (versi 18 atau lebih baru disarankan)
*   npm atau yarn
*   Kluster MongoDB atau instans MongoDB lokal
*   Akun Cloudinary
*   Akun Midtrans
*   Akun SendGrid (opsional, untuk pengiriman email)

### Instalasi

1.  Kloning repositori dan masuk ke direktori backend.
2.  Instal dependensi yang dibutuhkan:
    ```bash
    npm install
    ```
3.  Buat salinan file `.env.example` dan ubah namanya menjadi `.env`.
4.  Isi variabel lingkungan di dalam `.env` dengan kredensial asli Anda:
    ```bash
    cp .env.example .env
    ```

### Menjalankan Aplikasi

Untuk menjalankan server dalam mode pengembangan menggunakan nodemon (otomatis memuat ulang jika ada perubahan kode):

```bash
npm run server
```

Untuk menjalankan server dalam mode produksi:

```bash
npm start
```

Server akan berjalan pada porta (port) yang telah ditentukan di dalam file `.env` (nilai bawaan adalah 4000).

## Struktur Proyek

*   `config/`: File konfigurasi untuk koneksi eksternal (MongoDB, Cloudinary).
*   `controllers/`: Pengendali permintaan yang berisi logika bisnis utama untuk setiap rute.
*   `middleware/`: Middleware Express khusus untuk autentikasi, otorisasi, dan pengunggahan file.
*   `models/`: Definisi skema Mongoose untuk koleksi di basis data.
*   `routes/`: Definisi titik akhir (endpoint) API yang dipetakan ke controllernya masing-masing.
*   `templates/`: Berisi kerangka template yang digunakan dalam aplikasi (misalnya, template email HTML).
*   `server.js`: File masuk utama (entry point) untuk aplikasi backend ini.

## Dokumentasi API

Untuk pengujian API, tersedia file koleksi Postman (`postman_collection.json`) di direktori utama backend ini. File ini berisi semua endpoint untuk rute Admin, User, Seller, Mentor, Product, Course, Category, Cart, dan Payment. Anda dapat langsung mengimpornya ke dalam aplikasi Postman Anda.