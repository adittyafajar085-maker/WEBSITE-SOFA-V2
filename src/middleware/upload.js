/**
 * Middleware Upload Gambar (upload.js)
 * Menggunakan Multer untuk menangani pengunggahan foto produk, gambar artikel,
 * serta banner dan foto alur pemesanan dengan penamaan file yang unik.
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("../config/config");

// Pastikan direktori uploads tersedia
if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

// Konfigurasi penyimpanan disk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate nama file unik: prefix-timestamp-random.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanFieldName = file.fieldname.replace(/[^a-zA-Z0-9]/g, "");
    cb(null, `${cleanFieldName}-${uniqueSuffix}${ext}`);
  },
});

// Filter jenis file agar hanya gambar yang diizinkan
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|svg/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Hanya file gambar (JPG, PNG, WEBP, GIF, SVG) yang diperbolehkan!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB per file
  },
});

module.exports = upload;

