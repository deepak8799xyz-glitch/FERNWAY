# Voltra — a full-stack e-commerce demo

A small online electronics & gadgets shop built to show a complete, working stack:

- **Backend:** Node.js + Express REST API
- **Database:** SQLite via Node's built-in `node:sqlite` module — a single file, no separate
  server, and no native compilation step (this avoids the classic Windows `node-gyp`/Python
  build headaches that packages like `better-sqlite3` run into)
- **Frontend:** plain HTML/CSS/JavaScript (no build step, no framework) — served by the same backend
- **Payments:** Cash on delivery, plus optional card/UPI/netbanking checkout via Razorpay
- **Contact:** a working "Contact us" page that saves messages to the database

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
│   │   ├── orders.js     # POST /api/orders, payment-config, verify-payment, GET /api/orders
│   │   └── contact.js    # POST /api/contact
│   ├── middleware/auth.js
│   └── package.json
└── frontend/
    ├── index.html         # Shop / product grid
    ├── product.html        # Product detail
    ├── cart.html            # Cart
    ├── checkout.html      # Shipping form, payment method, place order
    ├── order-success.html
    ├── orders.html          # Order history
    ├── contact.html        # Contact us
    ├── login.html / register.html
    ├── css/style.css
    └── js/  (api.js, cart.js, main.js, and one file per page)
```

## Run it locally

You'll need [Node.js](https://nodejs.org) 22.5 or newer.

```bash
cd backend
npm install        # installs express, bcryptjs, jsonwebtoken, cors, dotenv, razorpay
cp .env.example .env   # set your own JWT_SECRET, and Razorpay keys if you want online payment
npm run seed        # creates data/store.db and loads the demo catalog
npm start            # starts the server on http://localhost:4000
```

Then open **http://localhost:4000** in your browser. The Express server serves the
`frontend/` folder as static files and the `/api/*` routes from the same port, so
there's nothing else to configure.

> **Upgrading from an older copy of this project?** The database schema changed (new
> payment columns on orders, plus a `contact_messages` table). Delete `backend/data/store.db`
> (and the `-shm`/`-wal` files next to it if present) and run `npm run seed` again — SQLite
> won't add the new columns to an existing file automatically.

If you'd rather serve the frontend separately (e.g. from a different static host),
set `API_BASE` at the top of `frontend/js/api.js` to your backend's full URL, and
make sure CORS stays enabled on the backend (it already is).

## How it works

- **Catalog** — `GET /api/products` lists products, with optional `?category=` and
  `?q=` search filters. Products live in the `products` table, seeded from `seed.js`,
  across Audio, Phones, Wearables, Computing, Smart Home, Accessories, and Clothes.
- **Accounts** — `POST /api/auth/register` and `/api/auth/login` create a user and
  return a JWT. The frontend stores it in `localStorage` and sends it as
  `Authorization: Bearer <token>` on authenticated requests.
- **Cart** — kept client-side in `localStorage` (id → quantity) so browsing doesn't
  require an account. Nothing about price is trusted from the client, though.
- **Checkout** — `POST /api/orders` requires login and accepts `payment_method: "cod"` or
  `"razorpay"`. The server always re-reads each product's current price and stock from
  SQLite, rejects the order if stock is insufficient, and — inside a single transaction —
  creates the order, its line items, and decrements stock. Prices can never be tampered
  with from the browser.
- **Order history** — `GET /api/orders` returns the logged-in user's past orders, along
  with payment method and status.
- **Contact form** — `POST /api/contact` saves a name/email/message to the
  `contact_messages` table. There's no admin UI for reading them yet — see below.

## Setting up Razorpay (optional)

Without any configuration, checkout only offers **Cash on delivery** — the app works
fully without Razorpay. To turn on online payment:

1. Create a free account at [razorpay.com](https://razorpay.com) and switch to **Test Mode**
   in the dashboard (top-left toggle).
2. Go to **Settings → API Keys** and generate a test key. You'll get a `Key Id`
   (starts with `rzp_test_`) and a `Key Secret`.
3. Put both in `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
   ```
4. Restart the server (`npm start`). The "Pay online" option will now appear at checkout.
5. Use [Razorpay's test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
   (e.g. card `4111 1111 1111 1111`, any future expiry, any CVV) to simulate a real payment
   — no actual money moves in test mode.

How the payment flow works, if you're curious: `POST /api/orders` creates the order in
SQLite and opens a matching order on Razorpay's side; the frontend then opens the Razorpay
Checkout widget. Once the shopper pays, Razorpay calls back into the page with a payment id
and signature, and the frontend sends those to `POST /api/orders/:id/verify-payment`, which
recomputes the signature server-side with your secret key. That recomputation — not the
browser's word for it — is what actually marks the order as paid.

## Reading contact messages

There's no admin page yet, so the simplest way to check messages is directly against
the database file with the `sqlite3` CLI (or any SQLite viewer):

```bash
sqlite3 backend/data/store.db "SELECT * FROM contact_messages ORDER BY created_at DESC;"
```

## Extending it

Some natural next steps if you want to keep building:
- An admin view for adding/editing products and reading contact messages
- Product images/reviews, pagination, or a wishlist table
- Emailing yourself (or the customer) on new orders and contact messages
- Password reset emails
- Deploying the backend (Render, Fly.io, Railway) and pointing `API_BASE` at it, plus
  switching Razorpay from test keys to live keys when you're ready to accept real payments
