// cart.js — the cart lives in localStorage as { [product_id]: quantity }.
// Real prices are always re-checked against the database at checkout time,
// so nothing here needs to be trusted for money math beyond a nice preview.

const Cart = {
  KEY: "voltra_cart",

  read() {
    const raw = localStorage.getItem(this.KEY);
    return raw ? JSON.parse(raw) : {};
  },

  write(cart) {
    localStorage.setItem(this.KEY, JSON.stringify(cart));
    Cart.updateBadge();
  },

  add(productId, qty = 1) {
    const cart = this.read();
    cart[productId] = (cart[productId] || 0) + qty;
    this.write(cart);
  },

  setQty(productId, qty) {
    const cart = this.read();
    if (qty <= 0) delete cart[productId];
    else cart[productId] = qty;
    this.write(cart);
  },

  remove(productId) {
    const cart = this.read();
    delete cart[productId];
    this.write(cart);
  },

  clear() {
    localStorage.removeItem(this.KEY);
    Cart.updateBadge();
  },

  count() {
    const cart = this.read();
    return Object.values(cart).reduce((sum, n) => sum + n, 0);
  },

  updateBadge() {
    const el = document.getElementById("cart-count");
    if (el) el.textContent = Cart.count();
  },
};
