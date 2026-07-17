// routes/auth.js — registration and login. Passwords are hashed with bcrypt,
// sessions are stateless JWTs handed back to the frontend and stored in localStorage.

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are all required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name, email.toLowerCase(), password_hash);

  const user = { id: info.lastInsertRowid, name, email: email.toLowerCase() };
  res.status(201).json({ token: signToken(user), user });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const user = { id: row.id, name: row.name, email: row.email };
  res.json({ token: signToken(user), user });
});

module.exports = router;
