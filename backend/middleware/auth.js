// middleware/auth.js — verifies the "Authorization: Bearer <token>" header
// and attaches the decoded user to req.user, or rejects the request.

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Please log in to continue." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
}

module.exports = { requireAuth, JWT_SECRET };
