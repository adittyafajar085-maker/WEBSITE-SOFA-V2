/**
 * Server Utama Website Meubel Adittya Putra
 * Berbasis Node.js, Express, dan EJS Engine
 * Dilengkapi session auth admin, public catalog, upload handler, dan dynamic store.json
 */

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const config = require("./src/config/config");
const connectDatabase = require("./src/config/database");
const publicRoutes = require("./src/routes/publicRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const authRoutes = require("./src/routes/authRoutes");
const productApiRoutes = require("./src/routes/productApiRoutes");
const StoreModel = require("./src/models/storeModel");

const app = express();
const PORT = config.port;

// Setup View Engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parser Body Request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serving File Statis
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Konfigurasi Session untuk Keamanan Login Admin
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set true jika menggunakan HTTPS di production
      maxAge: 1000 * 60 * 60 * 24, // Berlaku 24 jam
    },
  })
);

app.use((req, res, next) => {
  connectDatabase().then(() => next()).catch(next);
});

// Global Template Variables (Tersedia di semua file .ejs)
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.siteProfile = StoreModel.getProfile();
  next();
});

// ==========================================
// RUTE APLIKASI
// ==========================================

// Rute Autentikasi (/login & /logout)
app.use("/", authRoutes);

// Rute Dashboard Admin (/admin/*)
app.use("/admin", adminRoutes);
app.use("/api/products", productApiRoutes);

// Rute Publik untuk Pelanggan (/, /katalog, /cara-pesan, /postingan, dll)
app.use("/", publicRoutes);

// Penanganan Halaman 404 (Not Found)
app.use((req, res) => {
  const profile = StoreModel.getProfile();
  res.status(404).render("404", {
    title: "Halaman Tidak Ditemukan - 404",
    profile,
    message: "Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.",
    activePage: "404",
  });
});

// Penanganan Error Global 500
app.use((err, req, res, next) => {
  console.error("Terjadi error sistem:", err);
  res.status(500).send(`
    <div style="font-family:sans-serif; text-align:center; padding:50px;">
      <h2 style="color:#b91c1c;">Terjadi Kesalahan pada Server</h2>
      <p style="color:#4b5563;">${err.message || "Mohon maaf atas ketidaknyamanannya."}</p>
      <a href="/" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#854d0e; color:#fff; text-decoration:none; border-radius:8px;">Kembali ke Beranda</a>
    </div>
  `);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Meubel Adittya Putra aktif di http://localhost:${PORT}`);
  });
}

module.exports = app;

