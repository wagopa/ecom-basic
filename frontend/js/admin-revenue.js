let allOrders = [];
let currentFilter = "all"; // all, month, day

// Chart instances to support cleaning up before redrawing
let dailySalesChartInstance = null;
let statusChartInstance = null;

document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAdmin()) return;

  const monthTbody = document.getElementById("revenue-month-tbody");
  const dayTbody = document.getElementById("daily-sales-chart");
  const statusList = document.getElementById("status-summary-list");
  const topProductsList = document.getElementById("top-products-list");

  try {
    // Fetch up to 1000 orders for comprehensive revenue analytics
    const data = await Api.get("/orders?size=1000&sort=createdAt,desc");
    
    if (!data || !data.content) {
      throw new Error("Không thể đọc dữ liệu đơn hàng từ máy chủ.");
    }

    allOrders = data.content;

    // Initialize UI controls
    initControls();

    // Render the initial dashboard
    updateDashboard();

  } catch (err) {
    const errorMsg = `<div class="error" style="padding: 16px 0;">Lỗi: ${Utils.escapeHtml(err.message)}</div>`;
    if (monthTbody) monthTbody.innerHTML = `<tr><td colspan="4">${errorMsg}</td></tr>`;
    if (statusList) statusList.innerHTML = errorMsg;
    if (topProductsList) topProductsList.innerHTML = errorMsg;
  }
});

function initControls() {
  // Filter buttons listener
  document.querySelectorAll(".btn-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      updateDashboard();
    });
  });

  // Export report listener
  const exportBtn = document.getElementById("export-report-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportReport);
  }
}

function getFilteredOrders() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  return allOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    if (isNaN(orderDate.getTime())) return false;

    if (currentFilter === "month") {
      return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth;
    } else if (currentFilter === "day") {
      return orderDate.getFullYear() === currentYear &&
             orderDate.getMonth() === currentMonth &&
             orderDate.getDate() === currentDate;
    }
    return true; // "all"
  });
}

function updateDashboard() {
  const filteredOrders = getFilteredOrders();

  let totalDelivered = 0;
  let countDelivered = 0;

  let totalEstimated = 0;
  let countEstimated = 0;

  let totalPending = 0;
  let countPending = 0;

  let totalCancelled = 0;
  let countCancelled = 0;

  let totalOrders = 0;
  const statusBreakdown = {
    PENDING: { count: 0, amount: 0 },
    CONFIRMED: { count: 0, amount: 0 },
    SHIPPING: { count: 0, amount: 0 },
    DELIVERED: { count: 0, amount: 0 },
    CANCELLED: { count: 0, amount: 0 }
  };

  const productSalesMap = {}; // productId -> { name, img, qty, revenue }

  for (const order of filteredOrders) {
    const amount = Number(order.totalAmount) || 0;
    const status = order.status;
    totalOrders++;

    if (statusBreakdown[status]) {
      statusBreakdown[status].count++;
      statusBreakdown[status].amount += amount;
    }

    // High level groupings
    if (status === "DELIVERED") {
      totalDelivered += amount;
      countDelivered++;
    }
    
    if (status !== "CANCELLED") {
      totalEstimated += amount;
      countEstimated++;
    } else {
      totalCancelled += amount;
      countCancelled++;
    }

    if (status === "PENDING" || status === "CONFIRMED" || status === "SHIPPING") {
      totalPending += amount;
      countPending++;
    }

    // Aggregate Product Sales from items in non-cancelled orders
    if (status !== "CANCELLED" && order.items) {
      for (const item of order.items) {
        const pId = item.productId;
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal) || 0;

        if (!productSalesMap[pId]) {
          productSalesMap[pId] = {
            name: item.productName || `Sản phẩm #${pId}`,
            img: item.productImageUrl || "",
            qty: 0,
            revenue: 0
          };
        }
        productSalesMap[pId].qty += qty;
        productSalesMap[pId].revenue += sub;
      }
    }
  }

  // Populate total cards
  document.getElementById("revenue-delivered").textContent = Utils.formatCurrency(totalDelivered);
  document.getElementById("count-delivered").textContent = `${countDelivered} đơn đã giao thành công`;

  document.getElementById("revenue-estimated").textContent = Utils.formatCurrency(totalEstimated);
  document.getElementById("count-estimated").textContent = `${countEstimated} đơn (trừ huỷ)`;

  document.getElementById("revenue-pending").textContent = Utils.formatCurrency(totalPending);
  document.getElementById("count-pending").textContent = `${countPending} đơn chờ xử lý/giao`;

  document.getElementById("revenue-cancelled").textContent = Utils.formatCurrency(totalCancelled);
  document.getElementById("count-cancelled").textContent = `${countCancelled} đơn đã bị huỷ`;

  // Populate average statistics
  const aov = countDelivered > 0 ? (totalDelivered / countDelivered) : 0;
  document.getElementById("stat-aov").textContent = Utils.formatCurrency(aov);

  const cancelRate = totalOrders > 0 ? ((countCancelled / totalOrders) * 100) : 0;
  document.getElementById("stat-cancel-rate").textContent = `${cancelRate.toFixed(1)}%`;

  document.getElementById("stat-total-orders").textContent = totalOrders;

  // Render Top Selling Products
  renderTopProducts(productSalesMap);

  // Render Status Summary List
  renderStatusBreakdown(statusBreakdown);

  // Build Timeline Tables (Monthly & Daily Lists)
  const timelineData = calculateTimelineData();
  renderTimelineTables(timelineData.monthlyData, timelineData.dailyData);

  // Build Interactive Visual Charts (Line & Doughnut)
  renderCharts(timelineData.dailyData, statusBreakdown);
}

function renderTopProducts(productSalesMap) {
  const topProductsList = document.getElementById("top-products-list");
  if (!topProductsList) return;

  const sortedProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  if (sortedProducts.length === 0) {
    topProductsList.innerHTML = `<div class="muted" style="text-align: center; padding: 16px 0;">Không có dữ liệu bán hàng.</div>`;
    return;
  }

  topProductsList.innerHTML = sortedProducts.map(p => {
    const imgHtml = p.img 
      ? `<img src="${Utils.escapeHtml(p.img)}" alt="${Utils.escapeHtml(p.name)}">`
      : `<span class="no-image-sm" style="font-size: 0.58rem;">N/A</span>`;

    return `
      <div class="top-product-item">
        <div class="top-product-img">${imgHtml}</div>
        <div class="top-product-info">
          <span class="top-product-name" title="${Utils.escapeHtml(p.name)}">${Utils.escapeHtml(p.name)}</span>
          <span class="top-product-sales">${p.qty} sản phẩm đã bán</span>
        </div>
        <div class="top-product-revenue">
          <span class="top-product-rev-val">${Utils.formatCurrency(p.revenue)}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderStatusBreakdown(statusBreakdown) {
  const statusLabels = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã huỷ",
  };
  
  const statusList = document.getElementById("status-summary-list");
  if (!statusList) return;

  statusList.innerHTML = Object.keys(statusBreakdown).map(status => {
    const item = statusBreakdown[status];
    return `
      <div class="status-summary-item">
        <div class="status-summary-left">
          <span class="badge badge-${status.toLowerCase()}">${statusLabels[status] || status}</span>
        </div>
        <div class="status-summary-right">
          <span class="status-summary-val">${Utils.formatCurrency(item.amount)}</span>
          <span class="status-summary-count">${item.count} đơn hàng</span>
        </div>
      </div>
    `;
  }).join("");
}

function calculateTimelineData() {
  const monthlyData = {};
  const dailyData = {};

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  for (const order of allOrders) {
    const amount = Number(order.totalAmount) || 0;
    const status = order.status;

    if (status !== "DELIVERED") continue;

    const dateObj = new Date(order.createdAt);
    if (isNaN(dateObj.getTime())) continue;

    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    const dayKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    // Monthly
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { amount: 0, count: 0 };
    }
    monthlyData[monthKey].amount += amount;
    monthlyData[monthKey].count++;

    // Daily
    if (monthKey === currentMonthKey) {
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { amount: 0, count: 0 };
      }
      dailyData[dayKey].amount += amount;
      dailyData[dayKey].count++;
    }
  }

  return { monthlyData, dailyData };
}

function renderTimelineTables(monthlyData, dailyData) {
  const monthTbody = document.getElementById("revenue-month-tbody");
  const dayTbody = document.getElementById("revenue-day-tbody");

  // Monthly Render
  const sortedMonths = Object.keys(monthlyData).sort().reverse();
  if (monthTbody) {
    if (sortedMonths.length === 0) {
      monthTbody.innerHTML = `<tr><td colspan="4" class="muted" style="text-align: center; padding: 20px;">Chưa có doanh thu thực tế nào được ghi nhận.</td></tr>`;
    } else {
      const totalDeliveredSum = sortedMonths.reduce((sum, k) => sum + monthlyData[k].amount, 0) || 1;
      monthTbody.innerHTML = sortedMonths.map(k => {
        const monthObj = monthlyData[k];
        const contrib = ((monthObj.amount / totalDeliveredSum) * 100).toFixed(1);
        const [year, month] = k.split("-");
        return `
          <tr>
            <td>Tháng ${month}/${year}</td>
            <td class="mono">${monthObj.count} đơn</td>
            <td class="mono font-semibold text-success">${Utils.formatCurrency(monthObj.amount)}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="mono" style="min-width: 40px; font-size: 0.8rem;">${contrib}%</span>
                <div class="bar-track" style="flex: 1; margin: 0;">
                  <div class="bar-fill" style="width: ${contrib}%"></div>
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  // Daily Render
  const sortedDays = Object.keys(dailyData).sort().reverse();
  if (dayTbody) {
    if (sortedDays.length === 0) {
      dayTbody.innerHTML = `<tr><td colspan="4" class="muted" style="text-align: center; padding: 20px;">Không có doanh thu trong tháng này.</td></tr>`;
    } else {
      const maxDailyAmount = Math.max(...sortedDays.map(k => dailyData[k].amount)) || 1;
      dayTbody.innerHTML = sortedDays.map(k => {
        const dayObj = dailyData[k];
        const percentage = ((dayObj.amount / maxDailyAmount) * 100).toFixed(1);
        const [year, month, day] = k.split("-");
        return `
          <tr>
            <td>${day}/${month}/${year}</td>
            <td class="mono">${dayObj.count} đơn</td>
            <td class="mono font-semibold text-success">${Utils.formatCurrency(dayObj.amount)}</td>
            <td>
              <div class="bar-track" style="max-width: 150px; margin: 0;">
                <div class="bar-fill" style="width: ${percentage}%" title="${percentage}% so với ngày cao nhất"></div>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }
}

function renderCharts(dailyData, statusBreakdown) {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js is not loaded yet.");
    return;
  }

  // 1. Render Daily Sales Line Chart (VND)
  const lineCanvas = document.getElementById("daily-sales-chart");
  if (lineCanvas) {
    const ctx = lineCanvas.getContext("2d");
    if (dailySalesChartInstance) {
      dailySalesChartInstance.destroy();
    }

    const chronologicalDays = Object.keys(dailyData).sort(); // Chronological (oldest to newest)
    const labels = chronologicalDays.map(k => {
      const [year, month, day] = k.split("-");
      return `${day}/${month}`;
    });
    // convert USD total amount to VND by multiplying by 25000
    const values = chronologicalDays.map(k => dailyData[k].amount * 25000);

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(232, 147, 10, 0.25)");
    gradient.addColorStop(1, "rgba(232, 147, 10, 0.01)");

    dailySalesChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels.length ? labels : ["Chưa có dữ liệu"],
        datasets: [{
          label: "Doanh thu",
          data: values.length ? values : [0],
          borderColor: "#e8930a",
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#e8930a",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 12,
            titleFont: { family: "'Inter', sans-serif", size: 13, weight: '600' },
            bodyFont: { family: "'Inter', sans-serif", size: 13 },
            callbacks: {
              label: function(context) {
                let val = context.parsed.y || 0;
                return " Doanh thu: " + new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: "#5a6172" }
          },
          y: {
            grid: { color: "rgba(0, 0, 0, 0.04)" },
            ticks: { 
              font: { family: "'Inter', sans-serif", size: 11 }, 
              color: "#5a6172",
              callback: function(value) {
                if (value >= 1e6) return (value / 1e6).toFixed(1) + "M ₫";
                if (value >= 1e3) return (value / 1e3).toFixed(0) + "k ₫";
                return value + " ₫";
              }
            }
          }
        }
      }
    });
  }

  // 2. Render Status Doughnut Chart (Order Counts)
  const doughnutCanvas = document.getElementById("status-distribution-chart");
  if (doughnutCanvas) {
    const ctx = doughnutCanvas.getContext("2d");
    if (statusChartInstance) {
      statusChartInstance.destroy();
    }

    const statuses = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"];
    const labels = ["Chờ xử lý", "Đã xác nhận", "Đang giao", "Đã giao", "Đã huỷ"];
    const values = statuses.map(s => statusBreakdown[s] ? statusBreakdown[s].count : 0);
    const backgroundColors = ["#b5850a", "#0369a1", "#2563eb", "#0f8a5f", "#dc2626"];

    const totalOrders = values.reduce((sum, v) => sum + v, 0);

    statusChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { family: "'Inter', sans-serif", size: 11, weight: '500' },
              color: "#5a6172"
            }
          },
          tooltip: {
            padding: 12,
            callbacks: {
              label: function(context) {
                const count = context.parsed || 0;
                const percentage = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${count} đơn (${percentage}%)`;
              }
            }
          }
        },
        cutout: "70%"
      }
    });
  }
}

function exportReport() {
  const filteredOrders = getFilteredOrders();
  let totalDelivered = 0;
  let countDelivered = 0;
  let totalEstimated = 0;
  let countEstimated = 0;
  let totalCancelled = 0;
  let countCancelled = 0;
  let totalOrders = filteredOrders.length;

  const productSalesMap = {};

  for (const order of filteredOrders) {
    const amount = Number(order.totalAmount) || 0;
    const status = order.status;

    if (status === "DELIVERED") {
      totalDelivered += amount;
      countDelivered++;
    }
    if (status !== "CANCELLED") {
      totalEstimated += amount;
      countEstimated++;
    } else {
      totalCancelled += amount;
      countCancelled++;
    }

    if (status !== "CANCELLED" && order.items) {
      for (const item of order.items) {
        const pId = item.productId;
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal) || 0;
        if (!productSalesMap[pId]) {
          productSalesMap[pId] = { name: item.productName || `SP #${pId}`, qty: 0, revenue: 0 };
        }
        productSalesMap[pId].qty += qty;
        productSalesMap[pId].revenue += sub;
      }
    }
  }

  const aov = countDelivered > 0 ? (totalDelivered / countDelivered) : 0;
  const cancelRate = totalOrders > 0 ? ((countCancelled / totalOrders) * 100) : 0;

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const filterText = currentFilter === "all" ? "Tất cả thời gian" : (currentFilter === "month" ? "Tháng này" : "Hôm nay");
  
  let reportText = `==================================================
BÁO CÁO DOANH THU & HIỆU SUẤT BÁN HÀNG - STOCKROOM
==================================================
Thời gian xuất báo cáo: ${new Date().toLocaleString("vi-VN")}
Phạm vi dữ liệu: ${filterText}
Tổng số đơn hàng ghi nhận: ${totalOrders} đơn hàng

1. TỔNG QUAN DOANH THU (quy đổi sang VND):
--------------------------------------------------
- Doanh thu thực tế (Đã giao): ${Utils.formatCurrency(totalDelivered)} (${countDelivered} đơn)
- Doanh thu tạm tính (Chưa huỷ): ${Utils.formatCurrency(totalEstimated)} (${countEstimated} đơn)
- Doanh thu bị huỷ bỏ: ${Utils.formatCurrency(totalCancelled)} (${countCancelled} đơn)

2. CHỈ SỐ HOẠT ĐỘNG TRUNG BÌNH:
--------------------------------------------------
- Giá trị đơn hàng trung bình (AOV): ${Utils.formatCurrency(aov)}
- Tỷ lệ huỷ đơn hàng: ${cancelRate.toFixed(1)}%

3. TOP 5 SẢN PHẨM BÁN CHẠY NHẤT:
--------------------------------------------------
`;

  if (topProducts.length === 0) {
    reportText += "Chưa ghi nhận sản phẩm bán chạy trong khoảng thời gian này.\n";
  } else {
    topProducts.forEach((p, idx) => {
      reportText += `${idx + 1}. ${p.name}\n   - Số lượng bán: ${p.qty} sản phẩm\n   - Doanh thu đóng góp: ${Utils.formatCurrency(p.revenue)}\n\n`;
    });
  }

  reportText += `==================================================
Báo cáo được trích xuất tự động từ hệ thống STOCKROOM ADMIN.
`;

  // Download TXT file
  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `bao-cao-doanh-thu-${currentFilter}-${new Date().toISOString().slice(0,10)}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
