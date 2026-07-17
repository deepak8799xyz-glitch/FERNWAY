// routes/orders.js — checkout and order history. Prices and stock are always
// re-read from the database on checkout so the client can never manipulate a price.

const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// POST /api/orders
// body: { items: [{ product_id, quantity }], shipping: { name, address, city, zip } }
router.post("/", (req, res) => {
  const { items, shipping } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }
  if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.zip) {
    return res.status(400).json({ error: "Please complete the shipping address." });
  }

  const getProduct = db.prepare("SELECT * FROM products WHERE id = ?");
  const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
  const insertOrder = db.prepare(`
    INSERT INTO orders (user_id, status, total_cents, shipping_name, shipping_address, shipping_city, shipping_zip)
    VALUES (?, 'placed', ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, name, price_cents, quantity)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN");
  try {
    let total = 0;
    const resolved = [];

    for (const item of items) {
      const product = getProduct.get(item.product_id);
      const quantity = Number(item.quantity) || 0;

      if (!product) throw new Error(`Product ${item.product_id} no longer exists.`);
      if (quantity < 1) throw new Error(`Invalid quantity for ${product.name}.`);
      if (product.stock < quantity) throw new Error(`Only ${product.stock} left of ${product.name}.`);

      total += product.price_cents * quantity;
      resolved.push({ product, quantity });
    }

    const info = insertOrder.run(
      req.user.id,
      total,
      shipping.name,
      shipping.address,
      shipping.city,
      shipping.zip
    );
    const orderId = info.lastInsertRowid;

    for (const { product, quantity } of resolved) {
      insertItem.run(orderId, product.id, product.name, product.price_cents, quantity);
      updateStock.run(quantity, product.id);
    }

    db.exec("COMMIT");
    res.status(201).json({ order: { id: orderId, total_cents: total } });
  } catch (err) {
    db.exec("ROLLBACK");
    res.status(400).json({ error: err.message || "Checkout failed." });
  }
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
