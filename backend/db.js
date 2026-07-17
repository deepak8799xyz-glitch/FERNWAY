// db.js — opens the SQLite database and makes sure the schema exists.
// Using better-sqlite3: synchronous, fast, and perfect for a small store like this.

const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "store.db");
const db = new DatabaseSync(DB_PATH);

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  image_url   TEXT NOT NULL DEFAULT '',
  care_level  TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  status       TEXT NOT NULL DEFAULT 'placed',
  total_cents  INTEGER NOT NULL,
  shipping_name    TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city    TEXT NOT NULL,
  shipping_zip     TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    INTEGER NOT NULL REFERENCES orders(id),
  product_id  INTEGER NOT NULL REFERENCES products(id),
  name        TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  quantity    INTEGER NOT NULL
);
`);

module.exports = db;
