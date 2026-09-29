const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const { isAuthenticated } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map((product) => product.toObject({ virtuals: true })));
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuthenticated, upload.single("image"), async (req, res, next) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      category: req.body.category,
      categoryName: req.body.categoryName || req.body.category,
      price: req.body.price,
      specs: req.body.specs,
      description: req.body.description,
      featured: req.body.featured === "on" || req.body.featured === "true",
      url_gambar: req.file ? req.file.path : "/images/product-default.jpg",
    });

    res.status(201).json(product.toObject({ virtuals: true }));
  } catch (error) {
    next(error);
  }
});

module.exports = router;