const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"];
const STATUS_LABELS = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã huỷ",
};

let currentPage = 0;
let currentStatusFilter = "";

async function loadOrders(page) {
  currentPage = page;
  const tbody = document.getElementById("orders-tbody");
  tbody.innerHTML = `<tr><td colspan="6" class="muted">Đang tải&hellip;</td></tr>`;

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", "10");
  params.set("sort", "createdAt,desc");
  if (currentStatusFilter) params.set("status", currentStatusFilter);

  try {
    const data = await Api.get(`/orders?${params.toString()}`);
    renderOrders(data);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="error">${Utils.escapeHtml(e.message)}</td></tr>`;
  }
}

function renderOrders(data) {
  const tbody = document.getElementById("orders-tbody");

  if (!data.content.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted">Không có đơn hàng nào phù hợp với bộ lọc.</td></tr>`;
  } else {
    tbody.innerHTML = data.content
      .map(
        (o) => `
      <tr>
        <td class="mono"><a href="#" class="view-order-details-link font-semibold" data-order='${JSON.stringify(o).replaceAll("'", "&#39;")}'>#${o.id}</a></td>
        <td class="mono">KH #${o.userId}</td>
        <td>${Utils.formatDate(o.createdAt)}</td>
        <td class="mono font-semibold">${Utils.formatCurrency(o.totalAmount)}</td>
        <td><span class="badge badge-${o.status.toLowerCase()}">${STATUS_LABELS[o.status] || o.status}</span></td>
        <td>
          <div style="display: flex; align-items: center; gap: 4px; flex-wrap: nowrap; white-space: nowrap;">
            <select class="status-select" data-id="${o.id}" style="width: auto; padding: 6px 32px 6px 12px; margin: 0; font-size: 0.85rem;">
              ${STATUS_OPTIONS.map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${STATUS_LABELS[s] || s}</option>`).join("")}
            </select>
            <button type="button" class="btn-link view-order-btn" data-order='${JSON.stringify(o).replaceAll("'", "&#39;")}' style="padding: 6px 8px;">Xem</button>
            <button type="button" class="btn-link danger delete-order-btn" data-id="${o.id}" style="padding: 6px 8px;">Xoá</button>
          </div>
        </td>
      </tr>
    `
      )
      .join("");
  }

  Utils.renderPagination(document.getElementById("pagination"), data, loadOrders);

  tbody.querySelectorAll(".view-order-details-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      viewOrderDetails(JSON.parse(link.dataset.order));
    });
  });

  tbody.querySelectorAll(".view-order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      viewOrderDetails(JSON.parse(btn.dataset.order));
    });
  });

  tbody.querySelectorAll(".delete-order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteOrder(btn.dataset.id);
    });
  });

  tbody.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async () => {
      const id = select.dataset.id;
      const status = select.value;
      try {
        await Api.patch(`/orders/${id}/status`, { status });
        Utils.toast(`Đơn hàng #${id} đã cập nhật thành ${STATUS_LABELS[status] || status}`, "success");
        loadOrders(currentPage);
      } catch (e) {
        Utils.toast(e.message, "error");
        loadOrders(currentPage);
      }
    });
  });
}

function viewOrderDetails(o) {
  const detailsView = document.getElementById("order-details-view");
  const listView = document.getElementById("orders-list-view");
  const content = document.getElementById("order-details-content");
  document.getElementById("modal-order-id").textContent = `#${o.id}`;

  const itemsHtml = o.items.map(item => {
    const imgHtml = item.productImageUrl
      ? `<div class="cart-item-image" style="width: 40px; height: 40px;"><img src="${Utils.escapeHtml(item.productImageUrl)}" alt="${Utils.escapeHtml(item.productName)}"></div>`
      : `<div class="cart-item-image" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"><span class="no-image-sm" style="font-size: 0.55rem;">N/A</span></div>`;
    
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 8px; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${imgHtml}
          <div>
            <div style="font-weight: 600; font-size: 0.9rem; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${Utils.escapeHtml(item.productName)}</div>
            <div class="muted small">${Utils.formatCurrency(item.unitPrice)} x ${item.quantity}</div>
          </div>
        </div>
        <div class="mono" style="font-weight: 600; font-size: 0.92rem;">${Utils.formatCurrency(item.subtotal)}</div>
      </div>
    `;
  }).join("");

  content.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem; margin-bottom: 12px;">
      <div><span class="muted" style="display: inline-block; width: 140px;">Mã đơn hàng:</span> <span class="mono" style="font-weight: 600;">#${o.id}</span></div>
      <div><span class="muted" style="display: inline-block; width: 140px;">Mã khách hàng:</span> <span class="mono" style="font-weight: 600;">KH #${o.userId}</span></div>
      <div><span class="muted" style="display: inline-block; width: 140px;">Ngày đặt hàng:</span> <span>${Utils.formatDate(o.createdAt)}</span></div>
      <div><span class="muted" style="display: inline-block; width: 140px;">Trạng thái:</span> <span class="badge badge-${o.status.toLowerCase()}">${STATUS_LABELS[o.status] || o.status}</span></div>
    </div>
    <div class="sidebar-divider" style="margin: 8px 0 16px 0;"></div>
    <h3 style="margin: 0 0 12px 0; font-size: 1rem;">Danh sách sản phẩm</h3>
    <div style="max-height: 200px; overflow-y: auto; padding-right: 4px;">
      ${itemsHtml}
    </div>
    <div class="sidebar-divider" style="margin: 16px 0 12px 0;"></div>
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.05rem;">
      <span style="font-weight: 700; color: var(--ink);">Tổng tiền đơn hàng:</span>
      <span class="mono text-success font-semibold" style="font-size: 1.15rem; font-weight: 700;">${Utils.formatCurrency(o.totalAmount)}</span>
    </div>
    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <button type="button" class="danger" id="modal-delete-order-btn" data-id="${o.id}" style="padding: 8px 16px;">Xoá đơn hàng này</button>
    </div>
  `;

  const modalDeleteBtn = content.querySelector("#modal-delete-order-btn");
  if (modalDeleteBtn) {
    modalDeleteBtn.addEventListener("click", () => {
      detailsView.style.display = "none";
      listView.style.display = "block";
      deleteOrder(o.id);
    });
  }

  listView.style.display = "none";
  detailsView.style.display = "block";
}

async function deleteOrder(id) {
  if (!confirm(`Bạn có chắc chắn muốn xoá đơn hàng #${id} này? Hành động này sẽ xoá hoàn toàn đơn hàng khỏi cơ sở dữ liệu.`)) return;
  try {
    await Api.del(`/orders/${id}`);
    Utils.toast(`Đã xoá đơn hàng #${id}`, "success");
    loadOrders(currentPage);
  } catch (e) {
    Utils.toast(e.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.requireAdmin()) return;

  loadOrders(0);

  // Back button handler
  const backBtn = document.getElementById("back-to-orders-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      document.getElementById("order-details-view").style.display = "none";
      document.getElementById("orders-list-view").style.display = "block";
    });
  }

  document.getElementById("status-filter").addEventListener("change", (e) => {
    currentStatusFilter = e.target.value;
    loadOrders(0);
  });
});
