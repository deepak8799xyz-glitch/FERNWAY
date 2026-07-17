// routes/contact.js — a simple public contact form endpoint.
// Messages are stored in the database; there's no admin UI for them yet,
// but they're easy to inspect directly (see the README).

const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/", (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are all required." });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: "Message is too long." });
  }

  db.prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)").run(
    name,
    email,
    message
  );

  res.status(201).json({ ok: true });
});

module.exports = router;
