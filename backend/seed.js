// seed.js — wipes and repopulates the products table with electronics demo data.
// Run with: npm run seed

const db = require("./db");

const products = [
  // Audio
  { name: "AeroFit Noise-Cancelling Headphones", slug: "aerofit-anc-headphones", category: "Audio",
    description: "Over-ear ANC headphones with 40-hour battery life and plush memory-foam cushions.",
    price_cents: 24999, stock: 22, care_level: "2-year warranty",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" },
  { name: "Pulse True Wireless Earbuds", slug: "pulse-true-wireless-earbuds", category: "Audio",
    description: "Compact earbuds with active noise cancelling, wireless charging case, and IPX5 sweat resistance.",
    price_cents: 17999, stock: 30, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80" },
  { name: "Basecamp Portable Bluetooth Speaker", slug: "basecamp-bluetooth-speaker", category: "Audio",
    description: "Rugged, waterproof speaker with 20 hours of playtime and punchy 360-degree sound.",
    price_cents: 8999, stock: 26, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80" },
  { name: "Studio One Monitor Speakers (Pair)", slug: "studio-one-monitor-speakers", category: "Audio",
    description: "Powered studio monitors with a flat frequency response for accurate mixing and mastering.",
    price_cents: 32999, stock: 10, care_level: "2-year warranty",
    image_url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80" },

  // Wearables
  { name: "PulseBand Fitness Tracker", slug: "pulseband-fitness-tracker", category: "Wearables",
    description: "Tracks heart rate, sleep, and steps with a 10-day battery and a bright always-on display.",
    price_cents: 5999, stock: 40, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1575311373937-6ec70017f0f7?w=800&q=80" },
  { name: "Chronos Smartwatch Series X", slug: "chronos-smartwatch-series-x", category: "Wearables",
    description: "GPS smartwatch with cellular connectivity, ECG sensor, and a scratch-resistant sapphire face.",
    price_cents: 32999, stock: 15, care_level: "2-year warranty",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
  { name: "RestRing Sleep & Health Tracker", slug: "restring-sleep-tracker", category: "Wearables",
    description: "A titanium smart ring that tracks sleep stages, recovery, and readiness — no charging for a week.",
    price_cents: 29999, stock: 12, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800&q=80" },

  // Computing
  { name: "Slate 14 Ultrabook", slug: "slate-14-ultrabook", category: "Computing",
    description: "14-inch, 1.1kg laptop with a 16-hour battery, 16GB RAM, and a 1TB SSD.",
    price_cents: 119999, stock: 8, care_level: "2-year warranty",
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80" },
  { name: "Keystroke Mechanical Keyboard", slug: "keystroke-mechanical-keyboard", category: "Computing",
    description: "Hot-swappable mechanical switches, per-key RGB, and a machined aluminum frame.",
    price_cents: 12999, stock: 24, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80" },
  { name: "Glide Ergonomic Wireless Mouse", slug: "glide-ergonomic-mouse", category: "Computing",
    description: "A vertical grip that keeps your wrist neutral, with silent clicks and a 3-month battery life.",
    price_cents: 4999, stock: 35, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80" },
  { name: "ClearView 27\" 4K Monitor", slug: "clearview-27-4k-monitor", category: "Computing",
    description: "27-inch 4K IPS display with 99% sRGB coverage and a fully adjustable stand.",
    price_cents: 39999, stock: 14, care_level: "3-year warranty",
    image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80" },

  // Smart Home
  { name: "Echo Point Smart Speaker", slug: "echo-point-smart-speaker", category: "Smart Home",
    description: "Voice-controlled smart speaker with rich bass and built-in home automation hub.",
    price_cents: 9999, stock: 28, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80" },
  { name: "GlowSet Smart LED Bulbs (4-Pack)", slug: "glowset-smart-led-bulbs", category: "Smart Home",
    description: "Dimmable, color-changing bulbs that pair with voice assistants and app schedules.",
    price_cents: 3999, stock: 45, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80" },
  { name: "Sentry Video Doorbell", slug: "sentry-video-doorbell", category: "Smart Home",
    description: "1080p HD doorbell camera with night vision, motion alerts, and two-way audio.",
    price_cents: 14999, stock: 18, care_level: "2-year warranty",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" },

  // Accessories
  { name: "PowerCell 20,000mAh Power Bank", slug: "powercell-20000mah-power-bank", category: "Accessories",
    description: "Fast-charge two devices at once with enough capacity for multiple full phone charges.",
    price_cents: 4499, stock: 50, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1609592806596-4f1b5c9f7a4e?w=800&q=80" },
  // Phones
  { name: "Voltra Pulse X13", slug: "voltra-pulse-x13", category: "Phones",
    description: "6.5-inch OLED display, triple camera system, and all-day battery life.",
    price_cents: 89999, stock: 20, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80" },
  { name: "Voltra Pulse X13 Mini", slug: "voltra-pulse-x13-mini", category: "Phones",
    description: "The same X13 experience in a smaller, one-hand-friendly frame.",
    price_cents: 74999, stock: 24, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=800&q=80" },
  { name: "NovaPhone Lite 5G", slug: "novaphone-lite-5g", category: "Phones",
    description: "An affordable 5G phone with a 5000mAh battery and a smooth 90Hz display.",
    price_cents: 39999, stock: 30, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80" },

  // More Audio
  { name: "Bassline Over-Ear DJ Headphones", slug: "bassline-dj-headphones", category: "Audio",
    description: "Swiveling ear cups, coiled cable included, and deep bass tuned for mixing.",
    price_cents: 15999, stock: 18, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&q=80" },

  // More Computing
  { name: "Ridge 16 Pro Laptop", slug: "ridge-16-pro-laptop", category: "Computing",
    description: "16-inch creator laptop with a discrete GPU, 32GB RAM, and a 2TB SSD.",
    price_cents: 149999, stock: 6, care_level: "2-year warranty",
    image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80" },
  { name: "Compact 13 Chromebook", slug: "compact-13-chromebook", category: "Computing",
    description: "Light, fast-booting, and built for browsing, docs, and streaming on the go.",
    price_cents: 34999, stock: 22, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80" },

  // Clothes (Voltra merch)
  { name: "Voltra Logo Hoodie", slug: "voltra-logo-hoodie", category: "Clothes",
    description: "Heavyweight cotton-blend hoodie with an embroidered Voltra logo.",
    price_cents: 5499, stock: 40, care_level: "",
    image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80" },
  { name: "Voltra Tech Tee", slug: "voltra-tech-tee", category: "Clothes",
    description: "Soft, breathable crew-neck tee with a minimal front print.",
    price_cents: 2499, stock: 60, care_level: "",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
  { name: "Voltra Trucker Cap", slug: "voltra-trucker-cap", category: "Clothes",
    description: "Adjustable snapback with a structured front panel and embroidered logo.",
    price_cents: 1999, stock: 50, care_level: "",
    image_url: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80" }
];

const clear = db.prepare("DELETE FROM products");
const insert = db.prepare(`
  INSERT INTO products (name, slug, description, category, price_cents, stock, image_url, care_level)
  VALUES (@name, @slug, @description, @category, @price_cents, @stock, @image_url, @care_level)
`);

db.exec("BEGIN");
try {
  clear.run();
  for (const row of products) insert.run(row);
  db.exec("COMMIT");
} catch (err) {
  db.exec("ROLLBACK");
  throw err;
}

console.log(`Seeded ${products.length} products into store.db`);
