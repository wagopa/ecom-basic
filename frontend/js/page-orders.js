async function loadOrders(page) {
  const container = document.getElementById("orders-content");
  try {
    const data = await Api.get(`/orders?page=${page}&size=10&sort=createdAt,desc`);
    renderOrders(data);
  } catch (e) {
    container.innerHTML = `<p class="error">Không thể tải đơn hàng: ${Utils.escapeHtml(e.message)}</p>`;
  }
}

function renderOrders(data) {
  const container = document.getElementById("orders-content");

  if (!data.content.length) {
    container.innerHTML = `<p class="muted">Chưa có đơn hàng nào. <a href="index.html">Bắt đầu mua sắm</a> để đặt đơn đầu tiên.</p>`;
    return;
  }

  const statusMap = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã huỷ",
  };

  container.innerHTML = `
    <table class="orders-table">
      <thead><tr><th>Đơn hàng</th><th>Ngày đặt</th><th>Trạng thái</th><th>Tổng tiền</th><th></th></tr></thead>
      <tbody>
        ${data.content
          .map(
            (o) => `
          <tr>
            <td class="mono">#${o.id}</td>
            <td>${Utils.formatDate(o.createdAt)}</td>
            <td><span class="badge badge-${o.status.toLowerCase()}">${statusMap[o.status] || o.status}</span></td>
            <td>${Utils.formatCurrency(o.totalAmount)}</td>
            <td><a href="order-detail.html?id=${o.id}" style="font-weight: 600; font-size: 0.88rem;">Xem chi tiết &rarr;</a></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    <div id="pagination" class="pagination"></div>
  `;

  Utils.renderPagination(document.getElementById("pagination"), data, loadOrders);
}

document.addEventListener("DOMContentLoaded", () => {
  if (Auth.requireLogin()) {
    loadOrders(0);
  }
});
