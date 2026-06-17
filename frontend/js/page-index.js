let currentPage = 0;
const PAGE_SIZE = 12;

async function loadCategories() {
  const select = document.getElementById("category-filter");
  try {
    const data = await Api.get("/categories?size=100&sort=name,asc");
    data.content.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  } catch (e) {
    // Category filter is a nice-to-have; the grid still works without it.
    console.error("Không thể tải danh mục", e);
  }
}

function productCard(p) {
  const image = p.imageUrl
    ? `<img src="${Utils.escapeHtml(p.imageUrl)}" alt="${Utils.escapeHtml(p.name)}" loading="lazy" onerror="this.closest('.product-image').innerHTML='<div class=&quot;no-image&quot;>Không có ảnh</div>'">`
    : `<div class="no-image">Không có ảnh</div>`;

  const stockClass = p.quantity > 0 ? "stock-in" : "stock-out";
  const stockText = p.quantity > 0 ? `Còn ${p.quantity} sản phẩm` : "Hết hàng";
  const categoryName = p.category ? Utils.escapeHtml(p.category.name) : "";

  return `
    <a class="product-card" href="product.html?id=${p.id}">
      <div class="product-image">${image}</div>
      <div class="product-info">
        ${categoryName ? `<p class="muted small" style="margin:0 0 6px 0;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">${categoryName}</p>` : ""}
        <h3>${Utils.escapeHtml(p.name)}</h3>
        <span class="price-tag">${Utils.formatCurrency(p.price)}</span>
        <p class="${stockClass} small" style="margin-top:10px;">
          ${stockText}
        </p>
      </div>
    </a>
  `;
}

async function loadProducts(page) {
  currentPage = page;
  const grid = document.getElementById("product-grid");
  grid.innerHTML = `<p class="muted">Đang tải danh mục sản phẩm&hellip;</p>`;

  const keyword = document.getElementById("search-input").value.trim();
  const categoryId = document.getElementById("category-filter").value;

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(PAGE_SIZE));
  if (keyword) params.set("keyword", keyword);
  if (categoryId) params.set("categoryId", categoryId);

  try {
    const data = await Api.get(`/products?${params.toString()}`);
    if (!data.content.length) {
      grid.innerHTML = `<p class="muted">Không tìm thấy sản phẩm nào. Hãy thử từ khoá khác hoặc bỏ bộ lọc danh mục.</p>`;
      document.getElementById("pagination").innerHTML = "";
      return;
    }
    grid.innerHTML = data.content.map(productCard).join("");
    Utils.renderPagination(document.getElementById("pagination"), data, loadProducts);
  } catch (e) {
    grid.innerHTML = `<p class="error">Không thể tải danh mục sản phẩm: ${Utils.escapeHtml(e.message)}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();

  // Read initial keyword from URL (when redirected from search on other pages)
  const urlKeyword = Utils.qs("keyword");
  const searchInput = document.getElementById("search-input");
  if (urlKeyword && searchInput) {
    searchInput.value = urlKeyword;
  }

  loadProducts(0);

  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    loadProducts(0);
  });
  document.getElementById("category-filter").addEventListener("change", () => loadProducts(0));
});
