/**
 * Route Publik (publicRoutes.js)
 * Menangani akses publik untuk pelanggan (Halaman Utama, Katalog, Detail Produk,
 * Halaman Cara Pesan, Artikel / Postingan, dan Kontak). Pelanggan hanya bisa melihat (Read-only).
 */

const express = require("express");
const router = express.Router();
const StoreModel = require("../models/storeModel");
const Product = require("../models/productModel");
const Post = require("../models/postModel");

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

/**
 * Format angka ke Rupiah helper
 */
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

/**
 * Halaman Utama (Public View - /)
 */
router.get("/", asyncHandler(async (req, res) => {
  const profile = StoreModel.getProfile();
  const categories = StoreModel.getCategories();
  const products = await Product.find().sort({ createdAt: -1 });
  const posts = await Post.find().sort({ createdAt: -1 }).limit(3);

  res.render("home", {
    title: `${profile.name} - Spesialis Mebel Kayu & Custom Furniture Lamongan`,
    profile,
    categories,
    products,
    posts,
    formatRupiah,
    activePage: "home",
  });
}));

/**
 * Halaman Katalog & Pencarian (/katalog)
 */
router.get("/katalog", asyncHandler(async (req, res) => {
  const profile = StoreModel.getProfile();
  const categories = StoreModel.getCategories();
  const search = req.query.q || "";
  const selectedCategory = req.query.kategori || "all";

  let products = await Product.find().sort({ createdAt: -1 });
  if (selectedCategory && selectedCategory !== "all") {
    products = products.filter((product) => product.category === selectedCategory);
  }
  if (search.trim()) {
    const keyword = search.trim().toLowerCase();
    products = products.filter((product) =>
      [product.name, product.description, product.specs, product.categoryName]
        .some((value) => (value || "").toLowerCase().includes(keyword))
    );
  }

  res.render("katalog", {
    title: `Katalog Produk & Mebel - ${profile.name}`,
    profile,
    categories,
    products,
    search,
    selectedCategory,
    formatRupiah,
    activePage: "katalog",
  });
}));

/**
 * Halaman Detail Produk (/produk/:id)
 */
router.get("/produk/:id", asyncHandler(async (req, res) => {
  const profile = StoreModel.getProfile();
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).render("404", {
      title: "Produk Tidak Ditemukan",
      profile,
      message: "Produk mebel yang Anda cari tidak ditemukan atau telah dihapus.",
      activePage: "katalog",
    });
  }

  // Cari produk terkait dari kategori yang sama
  const relatedProducts = await Product.find({ category: product.category, _id: { $ne: product.id } })
    .sort({ createdAt: -1 })
    .limit(4);

  // Pesan otomatis WhatsApp rapi dan ramah
  const waMessage = `Halo ${profile.name}, saya tertarik dan ingin memesan produk:\n*${product.name}*\nHarga: ${formatRupiah(product.price)}\nSpesifikasi: ${product.specs || '-'}\n\nMohon info ketersediaan stok atau estimasi pengerjaan custom. Terima kasih!`;
  const waLink = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  res.render("product-detail", {
    title: `${product.name} - ${profile.name}`,
    profile,
    product,
    relatedProducts,
    waLink,
    formatRupiah,
    activePage: "katalog",
  });
}));

/**
 * Halaman Khusus Cara Pesan (/cara-pesan)
 */
router.get("/cara-pesan", (req, res) => {
  const profile = StoreModel.getProfile();

  // Pesan WhatsApp untuk konsultasi custom order
  const customWaMessage = `Halo ${profile.name}, saya ingin konsultasi mengenai pemesanan custom mebel (ukuran/model/warna khusus). Mohon arahan tahapannya. Terima kasih!`;
  const customWaLink = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(customWaMessage)}`;

  res.render("cara-pesan", {
    title: `Cara Pesan & Alur Order Custom - ${profile.name}`,
    profile,
    customWaLink,
    activePage: "cara-pesan",
  });
});

/**
 * Halaman Daftar Artikel / Postingan (/postingan)
 */
router.get("/postingan", asyncHandler(async (req, res) => {
  const profile = StoreModel.getProfile();
  const posts = await Post.find().sort({ createdAt: -1 });

  res.render("posts", {
    title: `Artikel, Tips Kayu & Portofolio - ${profile.name}`,
    profile,
    posts,
    activePage: "postingan",
  });
}));

/**
 * Halaman Detail Artikel / Postingan (/postingan/:slug)
 */
router.get("/postingan/:slug", asyncHandler(async (req, res) => {
  const profile = StoreModel.getProfile();
  let post = await Post.findOne({ slug: req.params.slug });
  if (!post) post = await Post.findById(req.params.slug);

  if (!post) {
    return res.status(404).render("404", {
      title: "Artikel Tidak Ditemukan",
      profile,
      message: "Artikel yang Anda cari tidak ditemukan.",
      activePage: "postingan",
    });
  }

  const otherPosts = await Post.find({ _id: { $ne: post.id } })
    .sort({ createdAt: -1 })
    .limit(3);

  res.render("post-detail", {
    title: `${post.title} - ${profile.name}`,
    profile,
    post,
    otherPosts,
    activePage: "postingan",
  });
}));

module.exports = router;

