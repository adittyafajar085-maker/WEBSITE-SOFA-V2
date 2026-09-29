/**
 * Middleware Upload Gambar (upload.js)
 * Menggunakan Multer untuk menangani pengunggahan foto produk, gambar artikel,
 * serta banner dan foto alur pemesanan dengan penamaan file yang unik.
 */

const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPostImage = req.originalUrl.includes("/posts/");
    const folder = file.fieldname === "image"
      ? `meubel-adittya/${isPostImage ? "posts" : "products"}`
      : "meubel-adittya/site";
    const basename = path.parse(file.originalname).name
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 40);

    return {
      folder,
      public_id: `${basename || file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
    };
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

