async function loadProduct() {
  const id = Utils.qs("id");
  const container = document.getElementById("product-detail");

  if (!id) {
    container.innerHTML = `<p class="error">Không có mã sản phẩm.</p>`;
    return;
  }

  try {
    const p = await Api.get(`/products/${id}`);
    const image = p.imageUrl
      ? `<img src="${Utils.escapeHtml(p.imageUrl)}" alt="${Utils.escapeHtml(p.name)}" onerror="this.closest('.product-image').innerHTML='<div class=&quot;no-image&quot;>Không có ảnh</div>'">`
      : `<div class="no-image">Không có ảnh</div>`;

    container.innerHTML = `
      <div class="product-detail-grid">
        <div class="product-image large">${image}</div>
        <div>
          <p class="muted small" style="text-transform:uppercase;letter-spacing:0.06em;font-size:0.75rem;margin-bottom:8px;">${Utils.escapeHtml(p.category.name)}</p>
          <h1 style="font-size:1.8rem;margin-bottom:12px;">${Utils.escapeHtml(p.name)}</h1>
          <span class="price-tag large">${Utils.formatCurrency(p.price)}</span>
          <p style="margin-top:24px;line-height:1.7;color:var(--ink-soft);">${Utils.escapeHtml(p.description || "Chưa có mô tả.")}</p>
          <p class="${p.quantity > 0 ? 'stock-in' : 'stock-out'}" style="margin-top:8px;font-weight:600;">${p.quantity > 0 ? "Còn " + p.quantity + " sản phẩm" : "Hết hàng"}</p>

          <div class="add-to-cart-row">
            <input type="number" id="qty-input" value="1" min="1" max="${p.quantity}" ${p.quantity === 0 ? "disabled" : ""}>
            <button type="button" class="primary" id="add-to-cart-btn" ${p.quantity === 0 ? "disabled" : ""}>Thêm vào giỏ</button>
          </div>
          <div id="add-to-cart-message" class="error"></div>
        </div>
      </div>
    `;

    const addBtn = document.getElementById("add-to-cart-btn");
    if (addBtn) {
      addBtn.addEventListener("click", async () => {
        if (!Auth.isLoggedIn()) {
          window.location.href = "login.html?redirect=" + encodeURIComponent(`product.html?id=${id}`);
          return;
        }
        const qty = parseInt(document.getElementById("qty-input").value, 10) || 1;
        const messageEl = document.getElementById("add-to-cart-message");
        messageEl.textContent = "";
        try {
          const cart = await Api.post("/cart/items", { productId: Number(id), quantity: qty });
          Utils.toast("Đã thêm vào giỏ hàng", "success");
          if (window.updateCartBadgeCountFromCart) {
            window.updateCartBadgeCountFromCart(cart);
          } else if (window.updateCartBadgeCount) {
            window.updateCartBadgeCount();
          }
        } catch (e) {
          messageEl.textContent = e.message;
        }
      });
    }
  } catch (e) {
    container.innerHTML = `<p class="error">Không thể tải sản phẩm: ${Utils.escapeHtml(e.message)}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadProduct);
