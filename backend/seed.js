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
  { name: "Junction 7-in-1 USB-C Hub", slug: "junction-usb-c-hub", category: "Accessories",
    description: "HDMI, SD card, USB-A, and 100W pass-through charging from a single compact hub.",
    price_cents: 5499, stock: 33, care_level: "1-year warranty",
    image_url: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80" }
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
