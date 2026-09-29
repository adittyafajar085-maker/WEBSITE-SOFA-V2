/**
 * Model Penyimpanan Data (storeModel.js)
 * Mengelola pembacaan dan penulisan data profil usaha, produk, artikel/postingan,
 * dan kredensial admin secara terpusat ke dalam file data/store.json.
 */

const fs = require("fs");
const path = require("path");
const config = require("../config/config");

class StoreModel {
  /**
   * Membaca seluruh data dari store.json
   * @returns {Object} Data lengkap store
   */
  static getStore() {
    try {
      if (!fs.existsSync(config.dataPath)) {
        throw new Error("File store.json tidak ditemukan!");
      }
      const rawData = fs.readFileSync(config.dataPath, "utf-8");
      return JSON.parse(rawData);
    } catch (error) {
      console.error("Gagal membaca store.json:", error.message);
      return {
        profile: {},
        admin: {},
        categories: [],
        products: [],
        posts: []
      };
    }
  }

  /**
   * Menyimpan data objek kembali ke file store.json dengan format rapi (indent 2)
   * @param {Object} data - Objek data yang akan disimpan
   */
  static saveStore(data) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(config.dataPath, jsonString, "utf-8");
      return true;
    } catch (error) {
      console.error("Gagal menulis ke store.json:", error.message);
      return false;
    }
  }

  // ==========================================
  // MANAJEMEN PROFIL TOKO
  // ==========================================

  static getProfile() {
    const store = this.getStore();
    return store.profile || {};
  }

  static updateProfile(updatedData) {
    const store = this.getStore();
    store.profile = {
      ...store.profile,
      ...updatedData
    };
    this.saveStore(store);
    return store.profile;
  }

  // ==========================================
  // MANAJEMEN KATEGORI
  // ==========================================

  static getCategories() {
    const store = this.getStore();
    return store.categories || [];
  }

  // ==========================================
  // MANAJEMEN PRODUK
  // ==========================================

  static getProducts({ search = "", category = "" } = {}) {
    const store = this.getStore();
    let products = store.products || [];

    // Filter berdasarkan Kategori Ruangan
    if (category && category !== "all" && category.trim() !== "") {
      products = products.filter(
        (p) => (p.category || "").toLowerCase() === category.toLowerCase()
      );
    }

    // Filter berdasarkan Pencarian Nama / Spesifikasi
    if (search && search.trim() !== "") {
      const keyword = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(keyword)) ||
          (p.description && p.description.toLowerCase().includes(keyword)) ||
          (p.specs && p.specs.toLowerCase().includes(keyword)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(keyword))
      );
    }

    return products;
  }

  static getProductById(id) {
    const store = this.getStore();
    return (store.products || []).find((p) => String(p.id) === String(id));
  }

  static addProduct(productData) {
    const store = this.getStore();
    if (!store.products) store.products = [];

    // Cari nama kategori yang sesuai
    const categories = store.categories || [];
    const matchedCategory = categories.find((c) => c.id === productData.category);
    const categoryName = matchedCategory ? matchedCategory.name : productData.category;

    const newProduct = {
      id: "prod-" + Date.now(),
      name: productData.name,
      category: productData.category,
      categoryName: categoryName,
      price: Number(productData.price) || 0,
      specs: productData.specs || "",
      description: productData.description || "",
      image: productData.image || "/images/product-default.jpg",
      featured: productData.featured === true || productData.featured === "on" || productData.featured === "true",
      createdAt: new Date().toISOString()
    };

    store.products.unshift(newProduct);
    this.saveStore(store);
    return newProduct;
  }

  static updateProduct(id, productData) {
    const store = this.getStore();
    if (!store.products) return null;

    const index = store.products.findIndex((p) => String(p.id) === String(id));
    if (index === -1) return null;

    const existing = store.products[index];
    const categories = store.categories || [];
    const matchedCategory = categories.find((c) => c.id === (productData.category || existing.category));
    const categoryName = matchedCategory ? matchedCategory.name : (productData.categoryName || existing.categoryName);

    store.products[index] = {
      ...existing,
      name: productData.name !== undefined ? productData.name : existing.name,
      category: productData.category !== undefined ? productData.category : existing.category,
      categoryName: categoryName,
      price: productData.price !== undefined ? Number(productData.price) || 0 : existing.price,
      specs: productData.specs !== undefined ? productData.specs : existing.specs,
      description: productData.description !== undefined ? productData.description : existing.description,
      image: productData.image ? productData.image : existing.image,
      featured: productData.featured !== undefined ? (productData.featured === true || productData.featured === "on" || productData.featured === "true") : existing.featured,
      updatedAt: new Date().toISOString()
    };

    this.saveStore(store);
    return store.products[index];
  }

  static deleteProduct(id) {
    const store = this.getStore();
    if (!store.products) return false;

    const initialLength = store.products.length;
    store.products = store.products.filter((p) => String(p.id) !== String(id));

    if (store.products.length !== initialLength) {
      this.saveStore(store);
      return true;
    }
    return false;
  }

  // ==========================================
  // MANAJEMEN POSTINGAN / ARTIKEL / GALERI
  // ==========================================

  static getPosts() {
    const store = this.getStore();
    return store.posts || [];
  }

  static getPostById(id) {
    const store = this.getStore();
    return (store.posts || []).find((post) => String(post.id) === String(id));
  }

  static getPostBySlug(slug) {
    const store = this.getStore();
    return (store.posts || []).find((post) => post.slug === slug);
  }

  static addPost(postData) {
    const store = this.getStore();
    if (!store.posts) store.posts = [];

    // Buat slug dari judul
    const slug = (postData.title || "postingan")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

    const newPost = {
      id: "post-" + Date.now(),
      title: postData.title,
      slug: slug,
      excerpt: postData.excerpt || "",
      content: postData.content || "",
      image: postData.image || "/images/post-default.jpg",
      author: postData.author || (store.profile ? store.profile.name : "Admin"),
      createdAt: new Date().toISOString()
    };

    store.posts.unshift(newPost);
    this.saveStore(store);
    return newPost;
  }

  static updatePost(id, postData) {
    const store = this.getStore();
    if (!store.posts) return null;

    const index = store.posts.findIndex((p) => String(p.id) === String(id));
    if (index === -1) return null;

    const existing = store.posts[index];

    store.posts[index] = {
      ...existing,
      title: postData.title !== undefined ? postData.title : existing.title,
      excerpt: postData.excerpt !== undefined ? postData.excerpt : existing.excerpt,
      content: postData.content !== undefined ? postData.content : existing.content,
      image: postData.image ? postData.image : existing.image,
      author: postData.author || existing.author,
      updatedAt: new Date().toISOString()
    };

    this.saveStore(store);
    return store.posts[index];
  }

  static deletePost(id) {
    const store = this.getStore();
    if (!store.posts) return false;

    const initialLength = store.posts.length;
    store.posts = store.posts.filter((p) => String(p.id) !== String(id));

    if (store.posts.length !== initialLength) {
      this.saveStore(store);
      return true;
    }
    return false;
  }

  // ==========================================
  // MANAJEMEN AUTENTIKASI ADMIN
  // ==========================================

  static verifyAdmin(email, password) {
    const store = this.getStore();
    const admin = store.admin || {};
    if (admin.email && admin.email.toLowerCase() === (email || "").toLowerCase().trim() && admin.password === (password || "").trim()) {
      return {
        email: admin.email,
        name: admin.name || "Owner Meubel Adittya Putra",
        role: "admin"
      };
    }
    return null;
  }

  static updateAdminPassword(oldPassword, newPassword) {
    const store = this.getStore();
    if (store.admin && store.admin.password === oldPassword) {
      store.admin.password = newPassword;
      this.saveStore(store);
      return true;
    }
    return false;
  }
}

module.exports = StoreModel;

