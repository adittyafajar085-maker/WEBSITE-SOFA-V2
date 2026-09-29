/**
 * Route Dashboard Admin (adminRoutes.js)
 * Khusus untuk owner / admin meubel. Terproteksi middleware autentikasi.
 * Mengelola Produk (CRUD), Postingan (CRUD), dan Profil Usaha (Banner, Kontak, Alur Pesan, Jam Buka).
 */

const express = require("express");
const router = express.Router();
const StoreModel = require("../models/storeModel");
const { isAuthenticated } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Semua route di bawah ini wajib terautentikasi
router.use(isAuthenticated);

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

// ==========================================
// 1. DASHBOARD UTAMA
// ==========================================
router.get("/", (req, res) => {
  const profile = StoreModel.getProfile();
  const products = StoreModel.getProducts();
  const posts = StoreModel.getPosts();
  const categories = StoreModel.getCategories();

  res.render("admin/dashboard", {
    title: "Dashboard Admin - Meubel Adittya Putra",
    profile,
    productsCount: products.length,
    postsCount: posts.length,
    categoriesCount: categories.length,
    recentProducts: products.slice(0, 5),
    recentPosts: posts.slice(0, 5),
    adminUser: req.session.user,
    formatRupiah,
    activeMenu: "dashboard",
    success: req.query.success || null,
    error: req.query.error || null,
  });
});

// ==========================================
// 2. MANAJEMEN PRODUK
// ==========================================

// Daftar Produk
router.get("/products", (req, res) => {
  const profile = StoreModel.getProfile();
  const categories = StoreModel.getCategories();
  const search = req.query.q || "";
  const category = req.query.kategori || "";
  const products = StoreModel.getProducts({ search, category });

  res.render("admin/products", {
    title: "Kelola Produk - Admin Meubel Adittya Putra",
    profile,
    categories,
    products,
    search,
    category,
    formatRupiah,
    adminUser: req.session.user,
    activeMenu: "products",
    success: req.query.success || null,
    error: req.query.error || null,
  });
});

// Form Tambah Produk Baru
router.get("/products/new", (req, res) => {
  const profile = StoreModel.getProfile();
  const categories = StoreModel.getCategories();

  res.render("admin/product-form", {
    title: "Tambah Produk Baru - Admin Meubel Adittya Putra",
    profile,
    categories,
    product: null,
    isEdit: false,
    adminUser: req.session.user,
    activeMenu: "products",
    error: null,
  });
});

// Proses Tambah Produk Baru
router.post("/products/new", upload.single("image"), (req, res) => {
  try {
    const { name, category, price, specs, description, featured } = req.body;

    let imagePath = "/images/product-default.jpg";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    StoreModel.addProduct({
      name,
      category,
      price,
      specs,
      description,
      image: imagePath,
      featured,
    });

    res.redirect("/admin/products?success=Produk+berhasil+ditambahkan");
  } catch (error) {
    console.error("Gagal menambah produk:", error);
    res.redirect("/admin/products/new?error=Terjadi+kesalahan+saat+menambah+produk");
  }
});

// Form Edit Produk
router.get("/products/edit/:id", (req, res) => {
  const profile = StoreModel.getProfile();
  const categories = StoreModel.getCategories();
  const product = StoreModel.getProductById(req.params.id);

  if (!product) {
    return res.redirect("/admin/products?error=Produk+tidak+ditemukan");
  }

  res.render("admin/product-form", {
    title: `Edit Produk: ${product.name}`,
    profile,
    categories,
    product,
    isEdit: true,
    adminUser: req.session.user,
    activeMenu: "products",
    error: null,
  });
});

// Proses Update Produk
router.post("/products/edit/:id", upload.single("image"), (req, res) => {
  try {
    const { name, category, price, specs, description, featured } = req.body;
    const existing = StoreModel.getProductById(req.params.id);

    if (!existing) {
      return res.redirect("/admin/products?error=Produk+tidak+ditemukan");
    }

    let imagePath = existing.image;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    StoreModel.updateProduct(req.params.id, {
      name,
      category,
      price,
      specs,
      description,
      image: imagePath,
      featured,
    });

    res.redirect("/admin/products?success=Produk+berhasil+diperbarui");
  } catch (error) {
    console.error("Gagal memperbarui produk:", error);
    res.redirect(`/admin/products/edit/${req.params.id}?error=Gagal+memperbarui+produk`);
  }
});

// Proses Hapus Produk
router.post("/products/delete/:id", (req, res) => {
  const deleted = StoreModel.deleteProduct(req.params.id);
  if (deleted) {
    res.redirect("/admin/products?success=Produk+berhasil+dihapus");
  } else {
    res.redirect("/admin/products?error=Gagal+menghapus+produk");
  }
});

// ==========================================
// 3. MANAJEMEN POSTINGAN / ARTIKEL / GALERI
// ==========================================

// Daftar Postingan
router.get("/posts", (req, res) => {
  const profile = StoreModel.getProfile();
  const posts = StoreModel.getPosts();

  res.render("admin/posts", {
    title: "Kelola Postingan & Artikel - Admin Meubel Adittya Putra",
    profile,
    posts,
    adminUser: req.session.user,
    activeMenu: "posts",
    success: req.query.success || null,
    error: req.query.error || null,
  });
});

// Form Tambah Postingan Baru
router.get("/posts/new", (req, res) => {
  const profile = StoreModel.getProfile();

  res.render("admin/post-form", {
    title: "Tambah Postingan Baru - Admin Meubel Adittya Putra",
    profile,
    post: null,
    isEdit: false,
    adminUser: req.session.user,
    activeMenu: "posts",
    error: null,
  });
});

// Proses Tambah Postingan Baru
router.post("/posts/new", upload.single("image"), (req, res) => {
  try {
    const { title, excerpt, content, author } = req.body;

    let imagePath = "/images/post-default.jpg";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    StoreModel.addPost({
      title,
      excerpt,
      content,
      image: imagePath,
      author: author || "Meubel Adittya Putra",
    });

    res.redirect("/admin/posts?success=Postingan+berhasil+diterbitkan");
  } catch (error) {
    console.error("Gagal menambah postingan:", error);
    res.redirect("/admin/posts/new?error=Terjadi+kesalahan+saat+menambah+postingan");
  }
});

// Form Edit Postingan
router.get("/posts/edit/:id", (req, res) => {
  const profile = StoreModel.getProfile();
  const post = StoreModel.getPostById(req.params.id);

  if (!post) {
    return res.redirect("/admin/posts?error=Postingan+tidak+ditemukan");
  }

  res.render("admin/post-form", {
    title: `Edit Postingan: ${post.title}`,
    profile,
    post,
    isEdit: true,
    adminUser: req.session.user,
    activeMenu: "posts",
    error: null,
  });
});

// Proses Update Postingan
router.post("/posts/edit/:id", upload.single("image"), (req, res) => {
  try {
    const { title, excerpt, content, author } = req.body;
    const existing = StoreModel.getPostById(req.params.id);

    if (!existing) {
      return res.redirect("/admin/posts?error=Postingan+tidak+ditemukan");
    }

    let imagePath = existing.image;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    StoreModel.updatePost(req.params.id, {
      title,
      excerpt,
      content,
      image: imagePath,
      author,
    });

    res.redirect("/admin/posts?success=Postingan+berhasil+diperbarui");
  } catch (error) {
    console.error("Gagal memperbarui postingan:", error);
    res.redirect(`/admin/posts/edit/${req.params.id}?error=Gagal+memperbarui+postingan`);
  }
});

// Proses Hapus Postingan
router.post("/posts/delete/:id", (req, res) => {
  const deleted = StoreModel.deletePost(req.params.id);
  if (deleted) {
    res.redirect("/admin/posts?success=Postingan+berhasil+dihapus");
  } else {
    res.redirect("/admin/posts?error=Gagal+menghapus+postingan");
  }
});

// ==========================================
// 4. KELOLA PROFIL TOKO & INFORMASI BISNIS
// ==========================================

router.get("/profile", (req, res) => {
  const profile = StoreModel.getProfile();

  res.render("admin/profile", {
    title: "Kelola Profil Toko & Informasi - Admin Meubel Adittya Putra",
    profile,
    adminUser: req.session.user,
    activeMenu: "profile",
    success: req.query.success || null,
    error: req.query.error || null,
  });
});

// Update Profil Toko (Foto, Banner, Deskripsi, Jam Operasional, Maps, dll)
router.post(
  "/profile",
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "orderFlowImage", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const currentProfile = StoreModel.getProfile();
      const body = req.body;

      // Handle file banner
      let bannerImagePath = currentProfile.hero ? currentProfile.hero.bannerImage : "/images/hero-banner.jpg";
      if (req.files && req.files["bannerImage"] && req.files["bannerImage"][0]) {
        bannerImagePath = `/uploads/${req.files["bannerImage"][0].filename}`;
      }

      // Handle file gambar alur pemesanan
      let orderFlowImagePath = currentProfile.orderFlowImage || "/images/order-flow.png";
      if (req.files && req.files["orderFlowImage"] && req.files["orderFlowImage"][0]) {
        orderFlowImagePath = `/uploads/${req.files["orderFlowImage"][0].filename}`;
      }

      // Format nomor WhatsApp: bersihkan karakter selain angka, ganti 08xxx menjadi 628xxx
      let cleanWa = (body.whatsapp || currentProfile.whatsapp || "").replace(/[^0-9]/g, "");
      if (cleanWa.startsWith("0")) {
        cleanWa = "62" + cleanWa.substring(1);
      }

      const updatedProfile = {
        name: body.name || currentProfile.name,
        tagline: body.tagline || currentProfile.tagline,
        description: body.description || currentProfile.description,
        foundedYear: Number(body.foundedYear) || currentProfile.foundedYear,
        phone: body.phone || currentProfile.phone,
        whatsapp: cleanWa,
        email: body.email || currentProfile.email,
        address: body.address || currentProfile.address,
        operationalHours: {
          weekdays: body.operationalWeekdays || (currentProfile.operationalHours ? currentProfile.operationalHours.weekdays : "Senin - Sabtu: 07.00 - 20.00 WIB"),
          sunday: body.operationalSunday || (currentProfile.operationalHours ? currentProfile.operationalHours.sunday : "Minggu: 10.00 - 20.00 WIB"),
        },
        maps: {
          plusCode: body.mapsPlusCode || (currentProfile.maps ? currentProfile.maps.plusCode : "V9RC+HW3 Lamongan"),
          directUrl: body.mapsDirectUrl || (currentProfile.maps ? currentProfile.maps.directUrl : ""),
          embedUrl: body.mapsEmbedUrl || (currentProfile.maps ? currentProfile.maps.embedUrl : ""),
        },
        hero: {
          title: body.heroTitle || (currentProfile.hero ? currentProfile.hero.title : ""),
          subtitle: body.heroSubtitle || (currentProfile.hero ? currentProfile.hero.subtitle : ""),
          bannerImage: bannerImagePath,
          ctaCatalogText: body.ctaCatalogText || "Lihat Katalog Produk",
          ctaCustomText: body.ctaCustomText || "Konsultasi Custom Order",
        },
        advantages: [
          {
            id: "adv-1",
            title: body.adv1Title || "Kayu Pilihan Anti Totor",
            description: body.adv1Desc || "Menggunakan bahan kayu solid pilihan berkualitas tinggi yang anti totor/kumbang kayu.",
            icon: "shield-check",
          },
          {
            id: "adv-2",
            title: body.adv2Title || "Pengrajin Berpengalaman > 10 Tahun",
            description: body.adv2Desc || "Didukung para pengrajin mebel ahli berpengalaman lebih dari 10 tahun.",
            icon: "user-check",
          },
          {
            id: "adv-3",
            title: body.adv3Title || "Menerima Custom Order Bebas",
            description: body.adv3Desc || "Bebas kustomisasi ukuran, warna finishing, dan model sesuai kebutuhan Anda.",
            icon: "sparkles",
          },
        ],
        orderFlowImage: orderFlowImagePath,
        googleAnalyticsId: body.googleAnalyticsId || "",
      };

      StoreModel.updateProfile(updatedProfile);

      res.redirect("/admin/profile?success=Profil+usaha+berhasil+diperbarui");
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      res.redirect("/admin/profile?error=Gagal+memperbarui+profil+toko");
    }
  }
);

module.exports = router;

