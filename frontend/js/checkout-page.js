// checkout-page.js — collects shipping info and places the order.
// Checkout requires a logged-in user; guests are sent to login and
// bounced back here afterward.

async function renderCheckout() {
  const root = document.getElementById("checkout-root");
  const cart = Cart.read();
  const ids = Object.keys(cart).map(Number);

  if (ids.length === 0) {
    root.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>Your cart is empty</h3><a href="index.html" class="btn btn-primary">Browse the shop</a></div>`;
    return;
  }

  if (!Api.currentUser()) {
    sessionStorage.setItem("voltra_return_to", "checkout.html");
    window.location.href = "login.html";
    return;
  }

  const { products: all } = await Api.products();
  const products = all.filter((p) => ids.includes(p.id));
  const lines = products.map((p) => ({ product: p, qty: cart[p.id] }));
  const subtotal = lines.reduce((sum, l) => sum + l.product.price_cents * l.qty, 0);
  const shipping = 500;
  const total = subtotal + shipping;
  const user = Api.currentUser();

  root.innerHTML = `
    <div class="form-card form-wide" style="margin:0;">
      <h3>Shipping address</h3>
      <div class="form-error" id="form-error"></div>
      <form id="checkout-form">
        <div class="field">
          <label for="name">Full name</label>
          <input type="text" id="name" value="${user.name}" required />
        </div>
        <div class="field">
          <label for="address">Street address</label>
          <input type="text" id="address" required placeholder="123 Circuit Ave" />
        </div>
        <div class="form-row">
          <div class="field">
            <label for="city">City</label>
            <input type="text" id="city" required />
          </div>
          <div class="field">
            <label for="zip">ZIP / postal code</label>
            <input type="text" id="zip" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block" id="place-order-btn">
          Place order — ${formatPrice(total)}
        </button>
      </form>
    </div>
    <div class="summary-card">
      <h3>Order summary</h3>
      ${lines
        .map(
          (l) => `<div class="summary-row"><span>${l.product.name} &times; ${l.qty}</span><span>${formatPrice(l.product.price_cents * l.qty)}</span></div>`
        )
        .join("")}
      <div class="summary-row"><span>Shipping</span><span>${formatPrice(shipping)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
    </div>
  `;

  document.getElementById("checkout-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("place-order-btn");
    btn.disabled = true;
    btn.textContent = "Placing order…";

    try {
      const { order } = await Api.placeOrder({
        items: lines.map((l) => ({ product_id: l.product.id, quantity: l.qty })),
        shipping: {
          name: document.getElementById("name").value,
          address: document.getElementById("address").value,
          city: document.getElementById("city").value,
          zip: document.getElementById("zip").value,
        },
      });
      Cart.clear();
      window.location.href = `order-success.html?id=${order.id}`;
    } catch (err) {
      const el = document.getElementById("form-error");
      el.textContent = err.message;
      el.classList.add("show");
      btn.disabled = false;
      btn.textContent = `Place order — ${formatPrice(total)}`;
    }
  });
}

document.addEventListener("DOMContentLoaded", renderCheckout);
