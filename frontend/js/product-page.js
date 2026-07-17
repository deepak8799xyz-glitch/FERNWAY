// product-page.js — loads a single product by slug (from the URL) and
// renders the detail view with a quantity picker.

async function loadProduct() {
  const root = document.getElementById("product-root");
  const slug = new URLSearchParams(window.location.search).get("slug");

  if (!slug) {
    root.innerHTML = `<div class="empty-state">No product specified.</div>`;
    return;
  }

  try {
    const { product: p } = await Api.product(slug);
    document.title = `Voltra — ${p.name}`;
    const out = p.stock === 0;

    root.innerHTML = `
      <div class="thumb"><img src="${p.image_url}" alt="${p.name}" /></div>
      <div>
        <span class="eyebrow">${p.category}</span>
        <h1>${p.name}</h1>
        <span class="price">${formatPrice(p.price_cents)}</span>
        <p class="desc">${p.description}</p>
        <ul class="meta-list">
          ${p.care_level ? `<li><span>Warranty</span><span>${p.care_level}</span></li>` : ""}
          <li><span>Availability</span><span>${out ? "Sold out" : `${p.stock} in stock`}</span></li>
        </ul>
        ${
          out
            ? `<button class="btn btn-primary" disabled>Sold out</button>`
            : `
          <div class="qty-row">
            <div class="qty-control">
              <button type="button" id="qty-minus">&minus;</button>
              <input type="number" id="qty-input" value="1" min="1" max="${p.stock}" />
              <button type="button" id="qty-plus">+</button>
            </div>
            <button class="btn btn-primary" id="add-to-cart">Add to cart</button>
          </div>
        `
        }
        <a href="index.html" class="btn-ghost">&larr; Back to shop</a>
      </div>
    `;

    if (!out) {
      const qtyInput = document.getElementById("qty-input");
      document.getElementById("qty-minus").addEventListener("click", () => {
        qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
      });
      document.getElementById("qty-plus").addEventListener("click", () => {
        qtyInput.value = Math.min(p.stock, Number(qtyInput.value) + 1);
      });
      document.getElementById("add-to-cart").addEventListener("click", () => {
        Cart.add(p.id, Number(qtyInput.value) || 1);
        showToast("Added to cart.");
      });
    }
  } catch (err) {
    root.innerHTML = `<div class="empty-state">Couldn't load this product: ${err.message}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadProduct);
