function renderNav() {
  const container = document.getElementById("navbar");
  if (!container) return;

  const user = Auth.getUser();
  const isAdminPage = window.location.pathname.includes("admin-");

  const shopIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  const cartIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
  const orderIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
  const adminIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="9" y1="9" x2="21" y2="9"/></svg>`;
  const logoutIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
  const loginIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;
  const registerIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`;
  const dashboardIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`;
  const categoryIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
  const productIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`;
  const revenueIcon = `<svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;

  if (isAdminPage) {
    container.style.display = "none";

    const mainEl = document.querySelector("main.container");
    if (mainEl && !document.querySelector(".admin-sidebar")) {
      const wrapper = document.createElement("div");
      wrapper.className = "admin-layout-wrapper";
      mainEl.parentNode.insertBefore(wrapper, mainEl);

      const isActive = (page) => window.location.pathname.endsWith(page) ? 'active' : '';

      const sidebar = document.createElement("aside");
      sidebar.className = "admin-sidebar";
      sidebar.innerHTML = `
        <div class="admin-sidebar-header">
          <a class="brand" href="admin-revenue.html"><span class="brand-mark"></span>STOCKROOM <span class="admin-badge">ADMIN</span></a>
          <div class="admin-user-info">
            <span class="admin-user-name" title="${Utils.escapeHtml(user ? user.fullName : "Quản trị viên")}">${Utils.escapeHtml(user ? user.fullName : "Quản trị viên")}</span>
            <span class="admin-user-role">Quản trị viên</span>
          </div>
        </div>
        <div class="admin-sidebar-menu">
          <p class="sidebar-title">Menu Quản trị</p>
          <a href="admin-revenue.html" class="${isActive('admin-revenue.html')}">${revenueIcon}Doanh thu</a>
          <a href="admin-categories.html" class="${isActive('admin-categories.html')}">${categoryIcon}Danh mục</a>
          <a href="admin-products.html" class="${isActive('admin-products.html')}">${productIcon}Sản phẩm</a>
          <a href="admin-orders.html" class="${isActive('admin-orders.html')}">${orderIcon}Đơn hàng</a>
          <div class="sidebar-divider"></div>
          <a href="index.html" class="shop-link">${shopIcon}Về cửa hàng</a>
        </div>
        <div class="admin-sidebar-footer">
          <button type="button" class="btn-logout" id="logout-btn">${logoutIcon}Đăng xuất</button>
        </div>
      `;
      wrapper.appendChild(sidebar);
      wrapper.appendChild(mainEl);

      const logoutBtn = sidebar.querySelector("#logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => Auth.logout());
      }
    }
    return;
  }

  let rightLinks;
  if (user) {
    rightLinks = `
      <a href="cart.html">${cartIcon}Giỏ hàng <span id="cart-badge" class="cart-badge" style="display: none;">0</span></a>
      <a href="orders.html">${orderIcon}Đơn hàng</a>
      ${user.role === "ADMIN" ? `<a href="admin-dashboard.html">${adminIcon}Quản trị</a>` : ""}
      <span class="nav-user">${Utils.escapeHtml(user.fullName)} &middot; ${Utils.escapeHtml(user.role)}</span>
      <button type="button" class="btn-link" id="logout-btn">${logoutIcon}Đăng xuất</button>
    `;
  } else {
    rightLinks = `
      <a href="login.html">${loginIcon}Đăng nhập</a>
      <a href="register.html">${registerIcon}Tạo tài khoản</a>
    `;
  }

  container.innerHTML = `
    <nav class="navbar">
      <a class="brand" href="index.html"><span class="brand-mark"></span>STOCKROOM</a>
      <form id="search-form" class="nav-search" action="index.html">
        <svg class="nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="search-input" placeholder="Tìm kiếm sản phẩm&hellip;" autocomplete="off">
      </form>
      <div class="nav-links">
        <a href="index.html">${shopIcon}Cửa hàng</a>
        ${rightLinks}
      </div>
    </nav>
  `;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => Auth.logout());
  }

  // If not on index page, redirect search to index.html with keyword
  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    const isIndexPage = window.location.pathname.endsWith("index.html")
      || window.location.pathname.endsWith("/")
      || window.location.pathname === "";
    if (!isIndexPage) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const keyword = document.getElementById("search-input").value.trim();
        window.location.href = keyword ? `index.html?keyword=${encodeURIComponent(keyword)}` : "index.html";
      });
    }
  }

  if (user) {
    setTimeout(() => {
      if (window.updateCartBadgeCount) window.updateCartBadgeCount();
    }, 50);
  }
}

window.updateCartBadgeCountFromCart = function(cart) {
  const badgeEl = document.getElementById("cart-badge");
  if (!badgeEl) return;
  const totalItems = (cart && cart.items) ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  badgeEl.textContent = totalItems;
  badgeEl.style.display = totalItems > 0 ? "inline-flex" : "none";
};

window.updateCartBadgeCount = async function() {
  if (!Auth.isLoggedIn()) return;
  try {
    const cart = await Api.get("/cart");
    window.updateCartBadgeCountFromCart(cart);
  } catch (err) {
    console.error("Không thể tải số lượng giỏ hàng", err);
  }
};

function renderFooter() {
  const isAdminPage = window.location.pathname.includes("admin-");
  if (isAdminPage || document.querySelector(".footer")) return;

  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="footer-container">
      <div class="footer-brand">
        <span class="brand-mark"></span>
        <span class="brand-text">STOCKROOM</span>
      </div>
      <p class="footer-desc">Cửa hàng trực tuyến cao cấp cung cấp sản phẩm chính hãng với dịch vụ tốt nhất.</p>
      <div class="footer-links">
        <a href="index.html">Cửa hàng</a>
        <a href="cart.html">Giỏ hàng</a>
        <a href="orders.html">Đơn hàng</a>
      </div>
      <div class="footer-divider"></div>
      <p class="footer-copy">&copy; 2026 STOCKROOM. Thiết kế tinh tế & tối giản.</p>
    </div>
  `;
  document.body.appendChild(footer);
}

document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  renderFooter();
});
