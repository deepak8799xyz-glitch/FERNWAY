// routes/orders.js — checkout, order history, and Razorpay payment verification.
// Prices and stock are always re-read from the database on checkout so the
// client can never manipulate a price.

const crypto = require("crypto");
const express = require("express");
const Razorpay = require("razorpay");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const razorpayEnabled = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

const razorpay = razorpayEnabled
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null;

router.use(requireAuth);

// GET /api/orders/payment-config — tells the frontend whether Razorpay is set up,
// and hands over the *public* key id (never the secret) so it can open the widget.
router.get("/payment-config", (req, res) => {
  res.json({ razorpayEnabled, keyId: razorpayEnabled ? RAZORPAY_KEY_ID : null });
});

// POST /api/orders
// body: { items: [{ product_id, quantity }], shipping: {...}, payment_method: "cod" | "razorpay" }
// Validates stock, computes the real total from the database, creates the order
// (and decrements stock) in a transaction. If payment_method is "razorpay", it
// also opens a Razorpay order so the frontend can launch the checkout widget.
router.post("/", async (req, res) => {
  const { items, shipping, payment_method = "cod" } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }
  if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.zip) {
    return res.status(400).json({ error: "Please complete the shipping address." });
  }
  if (!["cod", "razorpay"].includes(payment_method)) {
    return res.status(400).json({ error: "Unknown payment method." });
  }
  if (payment_method === "razorpay" && !razorpayEnabled) {
    return res.status(400).json({ error: "Online payment isn't configured on this server yet." });
  }

  const getProduct = db.prepare("SELECT * FROM products WHERE id = ?");
  const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
  const insertOrder = db.prepare(`
    INSERT INTO orders
      (user_id, status, total_cents, shipping_name, shipping_address, shipping_city, shipping_zip, payment_method, payment_status)
    VALUES (?, 'placed', ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, name, price_cents, quantity)
    VALUES (?, ?, ?, ?, ?)
  `);
  const setRazorpayOrderId = db.prepare("UPDATE orders SET razorpay_order_id = ? WHERE id = ?");

  let orderId, total;

  db.exec("BEGIN");
  try {
    let runningTotal = 0;
    const resolved = [];

    for (const item of items) {
      const product = getProduct.get(item.product_id);
      const quantity = Number(item.quantity) || 0;

      if (!product) throw new Error(`Product ${item.product_id} no longer exists.`);
      if (quantity < 1) throw new Error(`Invalid quantity for ${product.name}.`);
      if (product.stock < quantity) throw new Error(`Only ${product.stock} left of ${product.name}.`);

      runningTotal += product.price_cents * quantity;
      resolved.push({ product, quantity });
    }

    const initialPaymentStatus = payment_method === "cod" ? "unpaid" : "pending";
    const info = insertOrder.run(
      req.user.id,
      runningTotal,
      shipping.name,
      shipping.address,
      shipping.city,
      shipping.zip,
      payment_method,
      initialPaymentStatus
    );
    orderId = info.lastInsertRowid;
    total = runningTotal;

    for (const { product, quantity } of resolved) {
      insertItem.run(orderId, product.id, product.name, product.price_cents, quantity);
      updateStock.run(quantity, product.id);
    }

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    return res.status(400).json({ error: err.message || "Checkout failed." });
  }

  // Cash on delivery: the order is fully placed already.
  if (payment_method === "cod") {
    return res.status(201).json({ order: { id: orderId, total_cents: total, payment_method } });
  }

  // Razorpay: open a payment order on Razorpay's side and hand the frontend
  // what it needs to launch the checkout widget.
  try {
    const rpOrder = await razorpay.orders.create({
      amount: total, // already in the smallest currency unit (paise)
      currency: "INR",
      receipt: `order_${orderId}`,
    });
    setRazorpayOrderId.run(rpOrder.id, orderId);

    res.status(201).json({
      order: { id: orderId, total_cents: total, payment_method },
      razorpay: { orderId: rpOrder.id, amount: rpOrder.amount, currency: rpOrder.currency, keyId: RAZORPAY_KEY_ID },
    });
 } catch (err) {
    console.error("Razorpay order creation failed:", err);
    res.status(502).json({ error: "Could not start the payment. Please try again." });
  }
});

// POST /api/orders/:id/verify-payment
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Confirms the payment really came from Razorpay by recomputing the signature
// server-side with the secret key — this is the step that actually matters
// for trusting a payment, never the frontend's word for it.
router.post("/:id/verify-payment", (req, res) => {
  if (!razorpayEnabled) {
    return res.status(400).json({ error: "Online payment isn't configured on this server." });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment details." });
  }

  const order = db
    .prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.razorpay_order_id !== razorpay_order_id) {
    return res.status(400).json({ error: "This payment doesn't match this order." });
  }

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    db.prepare("UPDATE orders SET payment_status = 'failed' WHERE id = ?").run(order.id);
    return res.status(400).json({ error: "Payment verification failed." });
  }

  db.prepare("UPDATE orders SET payment_status = 'paid', razorpay_payment_id = ? WHERE id = ?")
    .run(razorpay_payment_id, order.id);

  res.json({ ok: true });
});

// GET /api/orders — order history for the logged-in user
router.get("/", (req, res) => {
  const orders = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);

  const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
  const withItems = orders.map((o) => ({ ...o, items: itemsStmt.all(o.id) }));

  res.json({ orders: withItems });
});

// GET /api/orders/:id — a single order, only if it belongs to the caller
router.get("/:id", (req, res) => {
  const order = db
    .prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);

  if (!order) return res.status(404).json({ error: "Order not found." });

  order.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  res.json({ order });
});

module.exports = router;
