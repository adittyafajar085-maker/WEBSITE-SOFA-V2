/**
 * Script Dashboard Admin (admin.js) - Meubel Adittya Putra
 * Menangani preview gambar sebelum upload, konfirmasi hapus data, dan interaktivitas dashboard.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Image Preview Helper
  function setupImagePreview(inputId, previewImgId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewImgId);

    if (input && preview) {
      input.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.remove("hidden");
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  // Pasang preview untuk form produk & postingan & profil
  setupImagePreview("product-image-input", "product-image-preview");
  setupImagePreview("post-image-input", "post-image-preview");
  setupImagePreview("banner-image-input", "banner-image-preview");
  setupImagePreview("orderflow-image-input", "orderflow-image-preview");

  // 2. Konfirmasi Hapus Data
  const deleteForms = document.querySelectorAll(".form-delete-confirm");
  deleteForms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      const itemName = form.getAttribute("data-item-name") || "item ini";
      const confirmed = confirm(`Apakah Anda yakin ingin menghapus "${itemName}"? Data yang dihapus tidak dapat dikembalikan.`);
      if (!confirmed) {
        e.preventDefault();
      }
    });
  });

  // 3. Admin Mobile Sidebar Toggle
  const adminMenuBtn = document.getElementById("admin-mobile-menu-btn");
  const adminSidebar = document.getElementById("admin-sidebar");
  if (adminMenuBtn && adminSidebar) {
    adminMenuBtn.addEventListener("click", () => {
      adminSidebar.classList.toggle("hidden");
    });
  }
});

