const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Product = require("../models/productModel");
const Post = require("../models/postModel");
const StoreModel = require("../models/storeModel");
const cloudinary = require("./cloudinary");

let connectionPromise;

async function migrateImage(image, folder, defaultImage) {
  if (!image || !image.startsWith("/uploads/")) return image || defaultImage;

  const localPath = path.join(__dirname, "../../public", image.replace(/^\/+/, ""));
  if (!fs.existsSync(localPath)) return defaultImage;

  const uploaded = await cloudinary.uploader.upload(localPath, {
    folder: `meubel-adittya/${folder}`,
    resource_type: "image",
  });
  return uploaded.secure_url;
}

async function connectAndSeed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI belum diatur pada environment.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const legacyStore = StoreModel.getStore();
  if (await Product.countDocuments() === 0 && legacyStore.products.length) {
    const products = await Promise.all(legacyStore.products.map(async (product) => ({
      ...product,
      _id: product.id,
      url_gambar: await migrateImage(product.image, "products", "/images/product-default.jpg"),
    })));
    await Product.insertMany(products);
  }

  if (await Post.countDocuments() === 0 && legacyStore.posts.length) {
    const posts = await Promise.all(legacyStore.posts.map(async (post) => ({
      ...post,
      _id: post.id,
      url_gambar: await migrateImage(post.image, "posts", "/images/post-default.jpg"),
    })));
    await Post.insertMany(posts);
  }

  console.log("Koneksi MongoDB aktif.");
}

function connectDatabase() {
  if (!connectionPromise) connectionPromise = connectAndSeed();
  return connectionPromise;
}

module.exports = connectDatabase;