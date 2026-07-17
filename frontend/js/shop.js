// shop.js — powers the homepage: category showcase, category filters,
// search, and the product grid.

let activeCategory = "";
let searchQuery = "";
let searchDebounce = null;

async function loadCategoryShowcase() {
  const wrap = document.getElementById("category-showcase-grid");
  try {
    const { products } = await Api.products();
    const byCategory = {};
    products.forEach((p) => {
      if (!byCategory[p.category]) byCategory[p.category] = { image: p.image_url, count: 0 };
      byCategory[p.category].count += 1;
    });

    wrap.innerHTML = Object.entries(byCategory)
      .map(
        ([cat, info]) => `
        <button class="category-tile" data-category="${cat}">
          <img src="${info.image}" alt="${cat}" loading="lazy" />
          <span class="category-tile-label">
            <strong>${cat}</strong>
            <span>${info.count} item${info.count === 1 ? "" : "s"}</span>
          </span>
        </button>
      `
      )
      .join("");

    wrap.querySelectorAll(".category-tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        selectCategory(tile.dataset.category);
        document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  } catch (err) {
    wrap.innerHTML = "";
  }
}

async function loadCategories() {
  const wrap = document.getElementById("category-filters");
  try {
    const { categories } = await Api.categories();
    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.textContent = cat;
      btn.dataset.category = cat;
      btn.addEventListener("click", () => selectCategory(cat));
      wrap.appendChild(btn);
    });
  } catch (err) {
    console.error(err);
  }
  wrap.querySelector('[data-category=""]').addEventListener("click", () => selectCategory(""));
}

function selectCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll("#category-filters button").forEach((b) => {
    b.classList.toggle("active", b.dataset.category === cat);
  });
  loadProducts();
}

function setupSearch() {
  const input = document.getElementById("search-input");
  input.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      searchQuery = input.value.trim();
      loadProducts();
    }, 300);
  });
}

async function loadProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "<p>Loading products…</p>";
  try {
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (searchQuery) params.q = searchQuery;

    const { products } = await Api.products(params);
    if (products.length === 0) {
      grid.innerHTML = `<div class="empty-state">Nothing matches that search — try a different term or category.</div>`;
      return;
    }
    grid.innerHTML = products.map(productCard).join("");
    grid.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        Cart.add(Number(btn.dataset.add), 1);
        showToast("Added to cart.");
      });
    });
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Couldn't load products: ${err.message}</div>`;
  }
}

function productCard(p) {
  const low = p.stock <= 5 && p.stock > 0;
  const out = p.stock === 0;
  const href = `product.html?slug=${encodeURIComponent(p.slug)}`;
  return `
    <div class="product-card">
      <a href="${href}"><div class="thumb"><img src="${p.image_url}" alt="${p.name}" loading="lazy" /></div></a>
      <div class="info">
        <span class="eyebrow">${p.category}</span>
        <a href="${href}"><h3>${p.name}</h3></a>
        <p class="desc">${p.description}</p>
        <div class="price-row">
          <span class="tag-price">${formatPrice(p.price_cents)}</span>
          <button class="btn btn-primary" data-add="${p.id}" ${out ? "disabled" : ""}>
            ${out ? "Sold out" : "Add"}
          </button>
        </div>
        ${low ? `<span class="stock-note low">Only ${p.stock} left</span>` : ""}
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  setupSearch();
  await Promise.all([loadCategoryShowcase(), loadCategories()]);
  await loadProducts();
});