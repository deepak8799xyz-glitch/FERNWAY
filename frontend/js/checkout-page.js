// checkout-page.js — collects shipping info, lets the shopper choose Cash on
// Delivery or Razorpay, and places the order. Checkout requires a logged-in
// user; guests are sent to login and bounced back here afterward.

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

  const [{ products: all }, paymentConfig] = await Promise.all([
    Api.products(),
    Api.paymentConfig().catch(() => ({ razorpayEnabled: false, keyId: null })),
  ]);

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

        <div class="field">
          <label>Payment method</label>
          <div class="payment-options">
            <label class="payment-option">
              <input type="radio" name="payment_method" value="cod" checked />
              <span>Cash on delivery</span>
            </label>
            <label class="payment-option ${paymentConfig.razorpayEnabled ? "" : "disabled"}">
              <input type="radio" name="payment_method" value="razorpay" ${paymentConfig.razorpayEnabled ? "" : "disabled"} />
              <span>Pay online — Card / UPI / Netbanking (Razorpay)</span>
            </label>
          </div>
          ${
            paymentConfig.razorpayEnabled
              ? ""
              : `<p class="stock-note" style="margin-top:8px;">Online payment isn't configured on this server yet — see the README to enable Razorpay.</p>`
          }
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
    const errorEl = document.getElementById("form-error");
    errorEl.classList.remove("show");
    btn.disabled = true;
    btn.textContent = "Placing order…";

    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
    const shippingInfo = {
      name: document.getElementById("name").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      zip: document.getElementById("zip").value,
    };

    try {
      const { order, razorpay } = await Api.placeOrder({
        items: lines.map((l) => ({ product_id: l.product.id, quantity: l.qty })),
        shipping: shippingInfo,
        payment_method: paymentMethod,
      });

      if (paymentMethod === "cod") {
        Cart.clear();
        window.location.href = `order-success.html?id=${order.id}`;
        return;
      }

      // Razorpay: launch the checkout widget, then verify the payment server-side.
      const rzp = new Razorpay({
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        order_id: razorpay.orderId,
        name: "Voltra",
        description: `Order #${order.id}`,
        prefill: { name: shippingInfo.name, email: user.email },
        theme: { color: "#3d7dff" },
        handler: async (response) => {
          try {
            await Api.verifyPayment(order.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            Cart.clear();
            window.location.href = `order-success.html?id=${order.id}`;
          } catch (err) {
            errorEl.textContent = `Payment succeeded but couldn't be verified: ${err.message}. Contact support with order #${order.id}.`;
            errorEl.classList.add("show");
            btn.disabled = false;
            btn.textContent = `Place order — ${formatPrice(total)}`;
          }
        },
        modal: {
          ondismiss: () => {
            errorEl.textContent = `Payment was cancelled. Your order #${order.id} is saved — you can retry payment from "My orders", or contact us.`;
            errorEl.classList.add("show");
            btn.disabled = false;
            btn.textContent = `Place order — ${formatPrice(total)}`;
          },
        },
      });
      rzp.open();
      btn.textContent = "Waiting for payment…";
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("show");
      btn.disabled = false;
      btn.textContent = `Place order — ${formatPrice(total)}`;
    }
  });
}

document.addEventListener("DOMContentLoaded", renderCheckout);
