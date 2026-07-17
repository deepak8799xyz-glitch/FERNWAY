// routes/products.js — public read-only catalog endpoints.

const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/products?category=Houseplants&q=fig
router.get("/", (req, res) => {
  const { category, q } = req.query;

  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (q) {
    sql += " AND (name LIKE ? OR description LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY created_at DESC";

  const products = db.prepare(sql).all(...params);
  res.json({ products });
});

router.get("/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM products ORDER BY category").all();
  res.json({ categories: rows.map((r) => r.category) });
});

router.get("/:slug", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE slug = ?").get(req.params.slug);
  if (!product) return res.status(404).json({ error: "Product not found." });
  res.json({ product });
});

module.exports = router;
