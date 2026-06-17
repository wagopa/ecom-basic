let editingId = null;
let currentPage = 0;

async function loadCategories(page) {
  currentPage = page;
  const tbody = document.getElementById("categories-tbody");
  tbody.innerHTML = `<tr><td colspan="3" class="muted">Đang tải&hellip;</td></tr>`;

  try {
    const data = await Api.get(`/categories?page=${page}&size=10&sort=name,asc`);
    renderCategories(data);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="3" class="error">${Utils.escapeHtml(e.message)}</td></tr>`;
  }
}

function renderCategories(data) {
  const tbody = document.getElementById("categories-tbody");

  if (!data.content.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="muted">Chưa có danh mục nào. Thêm danh mục đầu tiên ở trên.</td></tr>`;
  } else {
    tbody.innerHTML = data.content
      .map(
        (c) => `
      <tr>
        <td>${Utils.escapeHtml(c.name)}</td>
        <td class="muted">${Utils.escapeHtml(c.description || "")}</td>
        <td>
          <button type="button" class="btn-link edit-btn" data-id="${c.id}" data-name="${Utils.escapeHtml(c.name)}" data-description="${Utils.escapeHtml(c.description || "")}">Sửa</button>
          <button type="button" class="btn-link danger delete-btn" data-id="${c.id}">Xoá</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  Utils.renderPagination(document.getElementById("pagination"), data, loadCategories);

  tbody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => startEdit(btn.dataset.id, btn.dataset.name, btn.dataset.description));
  });
  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteCategory(btn.dataset.id));
  });
}

function startEdit(id, name, description) {
  editingId = id;
  document.getElementById("cat-name").value = name;
  document.getElementById("cat-description").value = description;
  document.getElementById("cancel-edit-btn").style.display = "inline-block";

  // Show form in editing mode
  const form = document.getElementById("category-form");
  form.style.display = "block";
  const btn = document.getElementById("toggle-form-btn");
  btn.textContent = "Đóng Form (Sửa)";
  btn.className = "secondary";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  editingId = null;
  document.getElementById("category-form").reset();
  document.getElementById("cancel-edit-btn").style.display = "none";
  document.getElementById("category-form").style.display = "none";
  
  const btn = document.getElementById("toggle-form-btn");
  btn.textContent = "+ Thêm danh mục";
  btn.className = "primary";
}

function toggleForm() {
  const form = document.getElementById("category-form");
  if (form.style.display === "none") {
    form.style.display = "block";
    const btn = document.getElementById("toggle-form-btn");
    btn.textContent = "Đóng Form";
    btn.className = "secondary";
  } else {
    resetForm();
  }
}

async function deleteCategory(id) {
  if (!confirm("Xoá danh mục này? Các sản phẩm đã gán vào danh mục vẫn hoạt động bình thường, nhưng danh mục sẽ không còn hiển thị trong bộ lọc.")) return;
  try {
    await Api.del(`/categories/${id}`);
    Utils.toast("Đã xoá danh mục", "success");
    loadCategories(currentPage);
  } catch (e) {
    Utils.toast(e.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.requireAdmin()) return;

  loadCategories(0);

  // Toggle button handler
  document.getElementById("toggle-form-btn").addEventListener("click", toggleForm);

  document.getElementById("category-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("form-error");
    errorEl.textContent = "";

    const payload = {
      name: document.getElementById("cat-name").value.trim(),
      description: document.getElementById("cat-description").value.trim() || null,
    };

    try {
      if (editingId) {
        await Api.put(`/categories/${editingId}`, payload);
        Utils.toast("Đã cập nhật danh mục", "success");
      } else {
        await Api.post("/categories", payload);
        Utils.toast("Đã thêm danh mục", "success");
      }
      resetForm();
      loadCategories(currentPage);
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

  document.getElementById("cancel-edit-btn").addEventListener("click", resetForm);
});
