const Utils = {
  formatCurrency(amount) {
    const value = Number(amount);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      Number.isFinite(value) ? value * 25000 : 0
    );
  },

  formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("vi-VN");
  },

  qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  },

  toast(message, type) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
    const el = document.createElement("div");
    el.className = "toast" + (type ? " toast-" + type : "");
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  },

  renderPagination(container, page, onPageChange) {
    const totalPages = Math.max(page.totalPages, 1);
    container.innerHTML = `
      <button type="button" data-action="prev" ${page.page <= 0 ? "disabled" : ""}>&larr; Trước</button>
      <span>Trang ${page.page + 1} / ${totalPages}</span>
      <button type="button" data-action="next" ${page.last ? "disabled" : ""}>Sau &rarr;</button>
    `;
    const prevBtn = container.querySelector('[data-action="prev"]');
    const nextBtn = container.querySelector('[data-action="next"]');
    if (prevBtn) prevBtn.addEventListener("click", () => onPageChange(page.page - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => onPageChange(page.page + 1));
  },
};
