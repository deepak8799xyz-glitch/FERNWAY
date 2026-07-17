// api.js — thin wrapper around fetch for talking to the backend.
// The frontend is served by the same Express server, so a relative
// "/api/..." path always reaches it, whether you open it via the
// backend's static server or host it separately (just set API_BASE).

const API_BASE = ""; // e.g. "http://localhost:4000" if serving frontend separately

const Api = {
  token() {
    return localStorage.getItem("voltra_token");
  },

  setToken(token) {
    if (token) localStorage.setItem("voltra_token", token);
    else localStorage.removeItem("voltra_token");
  },

  currentUser() {
    const raw = localStorage.getItem("voltra_user");
    return raw ? JSON.parse(raw) : null;
  },

  setUser(user) {
    if (user) localStorage.setItem("voltra_user", JSON.stringify(user));
    else localStorage.removeItem("voltra_user");
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
  },

  async request(path, { method = "GET", body, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = this.token();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data = null;
    try {
      data = await res.json();
    } catch (_) {
      /* no body */
    }

    if (!res.ok) {
      const message = (data && data.error) || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data;
  },

  products(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/products${qs ? `?${qs}` : ""}`);
  },
  product(slug) {
    return this.request(`/api/products/${slug}`);
  },
  categories() {
    return this.request(`/api/products/categories`);
  },

  register(payload) {
    return this.request(`/api/auth/register`, { method: "POST", body: payload });
  },
  login(payload) {
    return this.request(`/api/auth/login`, { method: "POST", body: payload });
  },

  placeOrder(payload) {
    return this.request(`/api/orders`, { method: "POST", body: payload, auth: true });
  },
  myOrders() {
    return this.request(`/api/orders`, { auth: true });
  },
  order(id) {
    return this.request(`/api/orders/${id}`, { auth: true });
  },
};
