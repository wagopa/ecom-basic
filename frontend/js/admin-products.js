let editingId = null;
let currentPage = 0;

async function loadCategoryOptions() {
  const select = document.getElementById("prod-category");
  try {
    const data = await Api.get("/categories?size=100&sort=name,asc");
    select.innerHTML = data.content.map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`).join("");
    if (!data.content.length) {
      select.innerHTML = `<option value="">Chưa có danh mục &mdash; hãy thêm danh mục trước</option>`;
    }
  } catch (e) {
    select.innerHTML = `<option value="">Không thể tải danh mục</option>`;
  }
}

async function loadProducts(page) {
  currentPage = page;
  const tbody = document.getElementById("products-tbody");
  tbody.innerHTML = `<tr><td colspan="6" class="muted">Đang tải&hellip;</td></tr>`;

  try {
    const data = await Api.get(`/products?page=${page}&size=10&sort=name,asc`);
    renderProducts(data);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" class="error">${Utils.escapeHtml(e.message)}</td></tr>`;
  }
}

function renderProducts(data) {
  const tbody = document.getElementById("products-tbody");

  if (!data.content.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted">Chưa có sản phẩm nào. Click "Thêm sản phẩm" ở trên.</td></tr>`;
  } else {
    tbody.innerHTML = data.content
      .map(
        (p) => {
          const imgHtml = p.imageUrl 
            ? `<div class="cart-item-image" style="width: 44px; height: 44px; margin: 0 auto;"><img src="${Utils.escapeHtml(p.imageUrl)}" alt="${Utils.escapeHtml(p.name)}"></div>`
            : `<div class="cart-item-image" style="width: 44px; height: 44px; margin: 0 auto; display: flex; align-items: center; justify-content: center;"><span class="no-image-sm" style="font-size: 0.58rem;">N/A</span></div>`;
          
          return `
            <tr>
              <td>${imgHtml}</td>
              <td><a href="#" class="view-details-link font-semibold" data-product='${JSON.stringify(p).replaceAll("'", "&#39;")}'>${Utils.escapeHtml(p.name)}</a></td>
              <td class="muted">${Utils.escapeHtml(p.category.name)}</td>
              <td class="mono font-semibold">${Utils.formatCurrency(p.price)}</td>
              <td class="mono">${p.quantity}</td>
              <td>
                <button type="button" class="btn-link view-btn" data-product='${JSON.stringify(p).replaceAll("'", "&#39;")}'>Xem</button>
                <button type="button" class="btn-link edit-btn" data-product='${JSON.stringify(p).replaceAll("'", "&#39;")}'>Sửa</button>
                <button type="button" class="btn-link danger delete-btn" data-id="${p.id}">Xoá</button>
              </td>
            </tr>
          `;
        }
      )
      .join("");
  }

  Utils.renderPagination(document.getElementById("pagination"), data, loadProducts);

  tbody.querySelectorAll(".view-details-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      viewProductDetails(JSON.parse(link.dataset.product));
    });
  });

  tbody.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      viewProductDetails(JSON.parse(btn.dataset.product));
    });
  });

  tbody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => startEdit(JSON.parse(btn.dataset.product)));
  });
  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteProduct(btn.dataset.id));
  });
}

function startEdit(p) {
  editingId = p.id;
  document.getElementById("prod-name").value = p.name;
  document.getElementById("prod-category").value = p.category.id;
  document.getElementById("prod-price").value = p.price;
  document.getElementById("prod-quantity").value = p.quantity;
  document.getElementById("prod-image").value = p.imageUrl || "";
  document.getElementById("prod-description").value = p.description || "";
  document.getElementById("cancel-edit-btn").style.display = "inline-block";

  // Show form in editing mode
  const form = document.getElementById("product-form");
  form.style.display = "block";
  const btn = document.getElementById("toggle-form-btn");
  btn.textContent = "Đóng Form (Sửa)";
  btn.className = "secondary";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  editingId = null;
  document.getElementById("product-form").reset();
  document.getElementById("cancel-edit-btn").style.display = "none";
  document.getElementById("product-form").style.display = "none";
  
  const btn = document.getElementById("toggle-form-btn");
  btn.textContent = "+ Thêm sản phẩm";
  btn.className = "primary";
}

function toggleForm() {
  const form = document.getElementById("product-form");
  if (form.style.display === "none") {
    form.style.display = "block";
    const btn = document.getElementById("toggle-form-btn");
    btn.textContent = "Đóng Form";
    btn.className = "secondary";
  } else {
    resetForm();
  }
}

function viewProductDetails(p) {
  const detailsView = document.getElementById("product-details-view");
  const listView = document.getElementById("products-list-view");
  const content = document.getElementById("product-details-content");
  
  const imgHtml = p.imageUrl 
    ? `<img src="${Utils.escapeHtml(p.imageUrl)}" alt="${Utils.escapeHtml(p.name)}" style="width: 100%; max-height: 320px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--line); box-shadow: var(--shadow-card);">`
    : `<div style="width: 100%; height: 260px; display: flex; align-items: center; justify-content: center; color: var(--ink-faint); font-family: var(--font-mono); font-size: 0.95rem; background: var(--bg); border-radius: var(--radius-sm); border: 1px dashed var(--line);">[Không có hình ảnh]</div>`;
    
  content.innerHTML = `
    <div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: start; width: 100%;">
      <!-- Left Column: Image -->
      <div style="flex: 0 0 300px; max-width: 100%;">
        ${imgHtml}
      </div>
      
      <!-- Right Column: Information -->
      <div style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <h3 style="font-size: 1.35rem; font-weight: 700; color: var(--ink); margin: 0 0 4px 0;">${Utils.escapeHtml(p.name)}</h3>
        <div class="sidebar-divider" style="margin: 4px 0 16px 0;"></div>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.95rem;">
          <div><span class="muted" style="display: inline-block; width: 140px;">Mã sản phẩm:</span> <span class="mono" style="font-weight: 600;">#${p.id}</span></div>
          <div><span class="muted" style="display: inline-block; width: 140px;">Danh mục:</span> <span style="font-weight: 600;">${Utils.escapeHtml(p.category.name)}</span></div>
          <div><span class="muted" style="display: inline-block; width: 140px;">Giá bán:</span> <span class="mono text-success font-semibold" style="font-size: 1.1rem; font-weight: 700;">${Utils.formatCurrency(p.price)}</span></div>
          <div><span class="muted" style="display: inline-block; width: 140px;">Tồn kho:</span> <span class="mono" style="font-weight: 600;">${p.quantity} sản phẩm</span></div>
          <div style="margin-top: 12px;">
            <div class="muted" style="margin-bottom: 6px; font-weight: 600;">Mô tả sản phẩm:</div>
            <div style="background: var(--bg); padding: 14px; border-radius: var(--radius-sm); line-height: 1.6; white-space: pre-wrap; max-height: 180px; overflow-y: auto; color: var(--ink-soft); font-size: 0.9rem; border: 1px solid var(--line);">${Utils.escapeHtml(p.description || "Chưa có mô tả cho sản phẩm này.")}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  listView.style.display = "none";
  detailsView.style.display = "block";
}

async function deleteProduct(id) {
  if (!confirm("Xoá sản phẩm này? Sản phẩm sẽ không còn hiển thị trong cửa hàng nhưng các đơn hàng cũ vẫn giữ nguyên.")) return;
  try {
    await Api.del(`/products/${id}`);
    Utils.toast("Đã xoá sản phẩm", "success");
    loadProducts(currentPage);
  } catch (e) {
    Utils.toast(e.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.requireAdmin()) return;

  loadCategoryOptions();
  loadProducts(0);

  // Toggle button handler
  document.getElementById("toggle-form-btn").addEventListener("click", toggleForm);

  // Back button handler
  const backBtn = document.getElementById("back-to-products-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      document.getElementById("product-details-view").style.display = "none";
      document.getElementById("products-list-view").style.display = "block";
    });
  }

  document.getElementById("product-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("form-error");
    errorEl.textContent = "";

    const imageUrl = document.getElementById("prod-image").value.trim();
    const payload = {
      name: document.getElementById("prod-name").value.trim(),
      description: document.getElementById("prod-description").value.trim() || null,
      price: parseFloat(document.getElementById("prod-price").value),
      quantity: parseInt(document.getElementById("prod-quantity").value, 10),
      imageUrl: imageUrl || null,
      categoryId: Number(document.getElementById("prod-category").value),
    };

    try {
      if (editingId) {
        await Api.put(`/products/${editingId}`, payload);
        Utils.toast("Đã cập nhật sản phẩm", "success");
      } else {
        await Api.post("/products", payload);
        Utils.toast("Đã thêm sản phẩm", "success");
      }
      resetForm();
      loadProducts(currentPage);
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

  document.getElementById("cancel-edit-btn").addEventListener("click", resetForm);
});
