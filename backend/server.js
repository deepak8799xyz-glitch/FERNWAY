// server.js — entry point. Wires up middleware, routes, and starts the server.

require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");
const contactRouter = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/contact", contactRouter);

// Serve the frontend as static files too, so the whole thing can run from one port.
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found." });
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Voltra API + storefront running at http://localhost:${PORT}`);
});
