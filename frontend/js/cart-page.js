// cart-page.js — joins the localStorage cart (id -> qty) with live product
// data from the API so prices and stock are always current.

async function renderCart() {
  const root = document.getElementById("cart-root");
  const cart = Cart.read();
  const ids = Object.keys(cart).map(Number);

  if (ids.length === 0) {
    root.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <h3>Your cart is empty</h3>
        <p>Nothing here yet.</p>
        <a href="index.html" class="btn btn-primary">Browse the shop</a>
      </div>`;
    return;
  }

  let products;
  try {
    const { products: all } = await Api.products();
    products = all.filter((p) => ids.includes(p.id));
  } catch (err) {
    root.innerHTML = `<div class="empty-state">Couldn't load your cart: ${err.message}</div>`;
    return;
  }

  const lines = products.map((p) => ({ product: p, qty: Math.min(cart[p.id], p.stock || cart[p.id]) }));
  const subtotal = lines.reduce((sum, l) => sum + l.product.price_cents * l.qty, 0);
  const shipping = subtotal > 0 ? 500 : 0;
  const total = subtotal + shipping;

  root.innerHTML = `
    <div class="cart-items">
      ${lines.map(lineHtml).join("")}
    </div>
    <div class="summary-card">
      <h3>Order summary</h3>
      <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${formatPrice(shipping)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
      <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:18px;">Proceed to checkout</a>
    </div>
  `;

  root.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      Cart.remove(Number(btn.dataset.remove));
      renderCart();
    });
  });

  root.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("change", () => {
      const id = Number(input.dataset.qty);
      const val = Math.max(1, Number(input.value) || 1);
      Cart.setQty(id, val);
      renderCart();
    });
  });
}

function lineHtml({ product: p, qty }) {
  return `
    <div class="cart-line">
      <img src="${p.image_url}" alt="${p.name}" />
      <div>
        <div class="name">${p.name}</div>
        <span class="eyebrow">${formatPrice(p.price_cents)} each</span><br/>
        <button class="remove" data-remove="${p.id}">Remove</button>
      </div>
      <input type="number" min="1" max="${p.stock}" value="${qty}" data-qty="${p.id}"
             style="width:56px;padding:6px;font-family:'JetBrains Mono',monospace;text-align:center;border:1px solid var(--sand);border-radius:4px;" />
      <div class="tag-price">${formatPrice(p.price_cents * qty)}</div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderCart);
