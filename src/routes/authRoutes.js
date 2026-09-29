/**
 * Route Autentikasi Admin (authRoutes.js)
 * Menangani login dan logout admin pemilik Meubel Adittya Putra.
 */

const express = require("express");
const router = express.Router();
const StoreModel = require("../models/storeModel");

/**
 * Tampilkan Form Login Admin
 */
router.get("/login", (req, res) => {
  // Jika admin sudah login sebelumnya, langsung arahkan ke dashboard
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return res.redirect("/admin");
  }

  const profile = StoreModel.getProfile();
  res.render("login", {
    title: `Login Admin - ${profile.name || "Meubel Adittya Putra"}`,
    profile,
    error: req.query.error || null,
    success: req.query.success || null,
    activePage: "login",
  });
});

/**
 * Proses Login Admin
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.redirect("/login?error=Silakan+masukkan+email+dan+password");
  }

  const adminUser = StoreModel.verifyAdmin(email, password);

  if (adminUser) {
    // Buat session admin
    req.session.user = adminUser;
    
    // Redirect ke URL tujuan sebelumnya jika ada, atau ke /admin
    const returnTo = req.session.returnTo || "/admin";
    delete req.session.returnTo;
    return res.redirect(returnTo);
  } else {
    return res.redirect("/login?error=Email+atau+password+salah.+Silakan+coba+lagi.");
  }
});

/**
 * Proses Logout Admin
 */
router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/login?success=Anda+telah+berhasil+keluar.");
    });
  } else {
    res.redirect("/login");
  }
});

module.exports = router;

