const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    url_gambar: { type: String, default: "/images/post-default.jpg" },
    author: { type: String, default: "Meubel Adittya Putra" },
  },
  { timestamps: true, _id: false }
);

postSchema.virtual("image")
  .get(function () { return this.url_gambar; })
  .set(function (value) { this.url_gambar = value; });

module.exports = mongoose.model("Post", postSchema);