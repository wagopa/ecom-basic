async function loadCart() {
  const container = document.getElementById("cart-content");
  try {
    const cart = await Api.get("/cart");
    renderCart(cart);
  } catch (e) {
    container.innerHTML = `<p class="error">Không thể tải giỏ hàng: ${Utils.escapeHtml(e.message)}</p>`;
  }
}

function renderCart(cart) {
  const container = document.getElementById("cart-content");
  if (window.updateCartBadgeCountFromCart) {
    window.updateCartBadgeCountFromCart(cart);
  } else if (window.updateCartBadgeCount) {
    window.updateCartBadgeCount();
  }

  if (!cart.items.length) {
    container.innerHTML = `<p class="muted">Giỏ hàng trống. <a href="index.html">Xem cửa hàng</a> để thêm sản phẩm.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-left">
        <table class="cart-table">
          <thead>
            <tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th><th></th></tr>
          </thead>
          <tbody>
            ${cart.items
              .map(
                (i) => `
              <tr>
                <td>
                  <div class="cart-item-product">
                    <div class="cart-item-image">
                      ${i.productImageUrl
                        ? `<img src="${Utils.escapeHtml(i.productImageUrl)}" alt="${Utils.escapeHtml(i.productName)}" onerror="this.closest('.cart-item-image').innerHTML='<div class=&quot;no-image-sm&quot;>N/A</div>'">`
                        : `<div class="no-image-sm">N/A</div>`}
                    </div>
                    <span class="cart-item-name">${Utils.escapeHtml(i.productName)}</span>
                  </div>
                </td>
                <td>${Utils.formatCurrency(i.unitPrice)}</td>
                <td><input type="number" class="qty-input" min="1" value="${i.quantity}" data-item-id="${i.id}"></td>
                <td>${Utils.formatCurrency(i.subtotal)}</td>
                <td><button type="button" class="btn-link danger remove-btn" data-item-id="${i.id}">Xoá</button></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="cart-right">
        <div class="form-card cart-summary">
          <h3>Tóm tắt đơn hàng</h3>
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span class="mono">${Utils.formatCurrency(cart.totalAmount)}</span>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span class="mono text-success">Miễn phí</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span class="price-text">${Utils.formatCurrency(cart.totalAmount)}</span>
          </div>
          <button type="button" class="primary checkout-btn" id="checkout-btn" style="width: 100%; margin-top: 16px;">Đặt hàng</button>
          <p class="error" id="checkout-message" style="margin-top: 12px; text-align: center;"></p>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const itemId = e.target.dataset.itemId;
      const qty = parseInt(e.target.value, 10);
      if (!qty || qty < 1) {
        loadCart();
        return;
      }
      try {
        const updated = await Api.put(`/cart/items/${itemId}`, { quantity: qty });
        renderCart(updated);
      } catch (err) {
        Utils.toast(err.message, "error");
        loadCart();
      }
    });
  });

  container.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const itemId = e.target.dataset.itemId;
      try {
        await Api.del(`/cart/items/${itemId}`);
        loadCart();
      } catch (err) {
        Utils.toast(err.message, "error");
      }
    });
  });

  document.getElementById("checkout-btn").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    const messageEl = document.getElementById("checkout-message");
    messageEl.textContent = "";
    try {
      const order = await Api.post("/orders", undefined);
      window.location.href = `order-detail.html?id=${order.id}`;
    } catch (err) {
      messageEl.textContent = err.message;
      btn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (Auth.requireLogin()) {
    loadCart();
  }
});
