/**
 * Script Interaktif Publik (main.js) - Meubel Adittya Putra
 * Menangani pencarian real-time, filter kategori dinamis, dan navigasi mobile.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // 2. Real-Time Search & Category Filtering pada Katalog
  const searchInput = document.getElementById("catalog-search-input");
  const filterPills = document.querySelectorAll(".filter-pill-btn");
  const productCards = document.querySelectorAll(".catalog-product-item");
  const emptyState = document.getElementById("catalog-empty-state");
  const productsCountBadge = document.getElementById("products-count-badge");

  let currentCategory = "all";
  let currentSearch = "";

  function applyFilters() {
    if (!productCards.length) return;

    let visibleCount = 0;

    productCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category") || "";
      const cardTitle = (card.getAttribute("data-title") || "").toLowerCase();
      const cardSpecs = (card.getAttribute("data-specs") || "").toLowerCase();

      const matchesCategory =
        currentCategory === "all" || cardCategory.toLowerCase() === currentCategory.toLowerCase();

      const matchesSearch =
        currentSearch === "" ||
        cardTitle.includes(currentSearch) ||
        cardSpecs.includes(currentSearch);

      if (matchesCategory && matchesSearch) {
        card.style.display = "flex";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.remove("hidden");
      } else {
        emptyState.classList.add("hidden");
      }
    }

    if (productsCountBadge) {
      productsCountBadge.textContent = `${visibleCount} Produk Ditemukan`;
    }
  }

  // Event listener untuk input pencarian
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  // Event listener untuk tombol pill kategori
  if (filterPills.length > 0) {
    filterPills.forEach((pill) => {
      pill.addEventListener("click", (e) => {
        e.preventDefault();

        // Update active class
        filterPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");

        currentCategory = pill.getAttribute("data-filter") || "all";
        applyFilters();
      });
    });
  }
});

