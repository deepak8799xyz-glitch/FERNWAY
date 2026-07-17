# Voltra — a full-stack e-commerce demo

A small online electronics & gadgets shop built to show a complete, working stack:

- **Backend:** Node.js + Express REST API
- **Database:** SQLite via Node's built-in `node:sqlite` module — a single file, no separate
  server, and no native compilation step (this avoids the classic Windows `node-gyp`/Python
  build headaches that packages like `better-sqlite3` run into)
- **Frontend:** plain HTML/CSS/JavaScript (no build step, no framework) — served by the same backend

> Requires **Node.js 22.5 or newer** (`node --version` to check). `node:sqlite` is still
> marked experimental upstream, so you'll see one harmless `ExperimentalWarning` line in the
> terminal when the server starts — that's expected, not an error.

```
voltra/
├── backend/
│   ├── server.js         # Express app entry point
│   ├── db.js             # SQLite connection + schema (auto-created)
│   ├── seed.js           # Populates demo products
│   ├── routes/
│   │   ├── auth.js       # POST /api/auth/register, /api/auth/login
│   │   ├── products.js   # GET  /api/products, /api/products/:slug
│   │   └── orders.js     # POST /api/orders, GET /api/orders
│   ├── middleware/auth.js
│   └── package.json
└── frontend/
    ├── index.html         # Shop / product grid
    ├── product.html        # Product detail
    ├── cart.html            # Cart
    ├── checkout.html      # Shipping form + place order
    ├── order-success.html
    ├── orders.html          # Order history
    ├── login.html / register.html
    ├── css/style.css
    └── js/  (api.js, cart.js, main.js, and one file per page)
```

## Run it locally

You'll need [Node.js](https://nodejs.org) 22.5 or newer.

```bash
cd backend
npm install        # installs express, bcryptjs, jsonwebtoken, cors, dotenv
cp .env.example .env   # optional: set your own JWT_SECRET
npm run seed        # creates data/store.db and loads 16 demo products
npm start            # starts the server on http://localhost:4000
```

Then open **http://localhost:4000** in your browser. The Express server serves the
`frontend/` folder as static files and the `/api/*` routes from the same port, so
there's nothing else to configure.

If you'd rather serve the frontend separately (e.g. from a different static host),
set `API_BASE` at the top of `frontend/js/api.js` to your backend's full URL, and
make sure CORS stays enabled on the backend (it already is).

## How it works

- **Catalog** — `GET /api/products` lists products, with optional `?category=` and
  `?q=` search filters. Products live in the `products` table, seeded from `seed.js`.
- **Accounts** — `POST /api/auth/register` and `/api/auth/login` create a user and
  return a JWT. The frontend stores it in `localStorage` and sends it as
  `Authorization: Bearer <token>` on authenticated requests.
- **Cart** — kept client-side in `localStorage` (id → quantity) so browsing doesn't
  require an account. Nothing about price is trusted from the client, though.
- **Checkout** — `POST /api/orders` requires login. The server re-reads each
  product's current price and stock from SQLite, rejects the order if stock is
  insufficient, and — inside a single transaction — creates the order, its line
  items, and decrements stock. This is the part that makes it a real backend rather
  than a static mockup: prices can't be tampered with from the browser.
- **Order history** — `GET /api/orders` returns the logged-in user's past orders.

## Extending it

Some natural next steps if you want to keep building:
- An admin view for adding/editing products (the `products` table already supports it)
- Product images/reviews, pagination, or a wishlist table
- Real payments via Stripe (swap the mock "Place order" step for a Payment Intent)
- Password reset emails, and moving JWT secret/config into a real `.env`
- Deploying the backend (Render, Fly.io, Railway) and pointing `API_BASE` at it
