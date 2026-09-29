const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    categoryName: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    specs: { type: String, default: "" },
    description: { type: String, default: "" },
    url_gambar: { type: String, default: "/images/product-default.jpg" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true, _id: false }
);

productSchema.virtual("image")
  .get(function () { return this.url_gambar; })
  .set(function (value) { this.url_gambar = value; });

module.exports = mongoose.model("Product", productSchema);