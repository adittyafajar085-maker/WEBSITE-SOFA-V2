/**
 * Middleware Autentikasi Admin (auth.js)
 * Memastikan rute-rute dashboard /admin hanya bisa diakses setelah login sukses.
 */

function isAuthenticated(req, res, next) {
  // Cek apakah session memiliki user dengan role admin
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  }

  // Simpan URL yang ingin dituju agar bisa redirect kembali jika diperlukan
  req.session.returnTo = req.originalUrl;
  
  // Jika belum login, redirect ke halaman login
  return res.redirect("/login");
}

module.exports = {
  isAuthenticated,
};

