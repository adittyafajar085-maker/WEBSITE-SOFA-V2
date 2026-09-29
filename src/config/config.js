/**
 * Konfigurasi Utama Aplikasi Meubel Adittya Putra
 * Berisi konfigurasi port, secret session, path penyimpanan, dan pengaturan lingkungan.
 */

const path = require("path");

module.exports = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || "meubel-adittya-putra-secret-key-2026",
  dataPath: path.join(__dirname, "../../data/store.json"),
  uploadsDir: path.join(__dirname, "../../public/uploads"),
};

