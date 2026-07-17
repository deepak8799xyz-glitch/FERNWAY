// main.js — shared chrome (header/footer), toast notifications, and small
// formatting helpers used by every page.

function formatPrice(cents) {
  const rupees = cents / 100;
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function sectionDivider() {
  return `<svg class="section-divider" viewBox="0 0 400 24" preserveAspectRatio="none" fill="none">
    <path d="M0 12 Q 50 2 100 12 T 200 12 T 300 12 T 400 12" stroke="currentColor" stroke-width="1.5"/>
  </svg>`;
}

function renderHeader(activePage) {
  const user = Api.currentUser();
  const nav = [
    { href: "index.html", label: "Shop", key: "shop" },
    { href: "contact.html", label: "Contact", key: "contact" },
  ];

  document.getElementById("site-header").innerHTML = `
    <div class="container">
      <a href="index.html" class="logo">Voltra<span class="dot">.</span></a>
      <nav class="main-nav">
        ${nav.map(n => `<a href="${n.href}" class="${activePage === n.key ? "active" : ""}">${n.label}</a>`).join("")}
        ${user ? `<a href="orders.html" class="${activePage === "orders" ? "active" : ""}">My orders</a>` : ""}
      </nav>
      <div class="nav-icons">
        ${user
          ? `<span class="eyebrow" style="margin:0;color:var(--parchment);opacity:.75">Hi, ${user.name.split(" ")[0]}</span>
             <button class="btn-ghost" id="logout-btn" style="color:var(--parchment);">Log out</button>`
          : `<a href="login.html" class="btn-ghost" style="color:var(--parchment);">Log in</a>`
        }
        <a href="cart.html" class="cart-link" style="color:var(--parchment);">
          Cart <span class="cart-count" id="cart-count">0</span>
        </a>
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Api.logout();
      showToast("Logged out.");
      setTimeout(() => (window.location.href = "index.html"), 500);
    });
  }

  Cart.updateBadge();
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <span>Voltra — electronics and gadgets, shipped with care.</span>
      <span><a href="contact.html" style="color:inherit;">Contact us</a> · support@voltra-shop.example · +91 120 456 7890</span>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "";
  renderHeader(page);
  renderFooter();
});
