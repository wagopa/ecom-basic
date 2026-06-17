const ORDER_STEPS = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED"];

const STEP_NAMES = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã huỷ",
};

const STEP_ICONS = {
  PENDING: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  CONFIRMED: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  SHIPPING: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
  DELIVERED: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></svg>`,
  CANCELLED: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
};

function renderTracker(status) {
  if (status === "CANCELLED") {
    return `
      <div class="tracker cancelled" style="margin: 0;">
        <div class="tracker-step current" style="border-right: none;">
          <div class="tracker-step-content">
            <div class="tracker-step-icon">
              ${STEP_ICONS.CANCELLED}
            </div>
            <div>
              <div class="step-label">Trạng thái</div>
              <div class="step-name">Đã huỷ</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const currentIndex = ORDER_STEPS.indexOf(status);
  return `
    <div class="tracker" style="margin: 0;">
      ${ORDER_STEPS.map((s, i) => {
        const cls = i < currentIndex ? "done" : i === currentIndex ? "current" : "";
        return `
          <div class="tracker-step ${cls}">
            <div class="tracker-step-content">
              <div class="tracker-step-icon">
                ${STEP_ICONS[s] || ""}
              </div>
              <div>
                <div class="step-label">Bước ${i + 1}</div>
                <div class="step-name">${STEP_NAMES[s] || s}</div>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

async function loadOrderDetail() {
  const id = Utils.qs("id");
  const container = document.getElementById("order-detail-content");

  if (!id) {
    container.innerHTML = `<p class="error">Không có mã đơn hàng.</p>`;
    return;
  }

  try {
    const o = await Api.get(`/orders/${id}`);

    container.innerHTML = `
      <div class="catalog-header" style="margin-bottom: 24px;">
        <div>
          <h1 style="margin: 0 0 6px 0;">Đơn hàng #${o.id}</h1>
          <p class="muted" style="margin: 0;">Đặt ngày ${Utils.formatDate(o.createdAt)}</p>
        </div>
        <div>
          <span class="badge badge-${o.status.toLowerCase()}">${STEP_NAMES[o.status] || o.status}</span>
        </div>
      </div>

      <!-- Order Progress Tracker (Full-Width Card) -->
      <div class="form-card" style="margin-bottom: 32px; padding: 24px;">
        <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-soft); font-family: var(--font-mono);">Tiến trình đơn hàng</h3>
        ${renderTracker(o.status)}
      </div>

      <div class="cart-layout">
        <div class="cart-left">
          <table class="cart-table">
            <thead>
              <tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th></tr>
            </thead>
            <tbody>
              ${o.items
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
                  <td>${i.quantity}</td>
                  <td>${Utils.formatCurrency(i.subtotal)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <div class="cart-right">
          <div class="form-card cart-summary">
            <h3>Chi tiết thanh toán</h3>
            <div class="summary-row">
              <span>Trạng thái:</span>
              <span class="badge badge-${o.status.toLowerCase()}" style="font-size: 0.65rem;">${STEP_NAMES[o.status] || o.status}</span>
            </div>
            <div class="summary-row">
              <span>Vận chuyển:</span>
              <span class="text-success" style="font-size: 0.9rem;">Miễn phí</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span>Tổng thanh toán:</span>
              <span class="price-text">${Utils.formatCurrency(o.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<p class="error">Không thể tải đơn hàng: ${Utils.escapeHtml(e.message)}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (Auth.requireLogin()) {
    loadOrderDetail();
  }
});
