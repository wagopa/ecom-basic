# STOCKROOM — E-Commerce Website & Admin Console

Dự án thương mại điện tử mini bao gồm **Backend REST API** (Spring Boot 3 + Java 21) kết hợp với **Frontend Storefront & Admin Panel** tối giản, cao cấp (HTML/CSS/JS thuần). Dự án được thiết kế trực quan, gọn gàng, hỗ trợ chạy Docker hóa toàn bộ hệ thống.

---

## ⚡ Khởi Chạy Nhanh (Quick Start)

Dự án được cấu hình sẵn Docker Compose bao gồm 3 dịch vụ: Spring Boot API (`app`), Nginx Frontend (`frontend`), và MySQL Database (`db`).

```bash
# 1. Tạo file môi trường từ file ví dụ
cp .env.example .env

# 2. Khởi chạy toàn bộ hệ thống qua Docker Compose
docker compose up --build -d
```

Sau khi chạy thành công:
- **Trang chủ Cửa hàng & Admin**: `http://localhost:8081`
- **Tài liệu REST API**: `http://localhost:8080/api`
- **MySQL Database**: Cổng `3307` (nội bộ container chạy cổng `3306`)

### 👤 Tài khoản Admin Mặc định
Hệ thống tự động khởi tạo (seed) tài khoản Admin khi chạy lần đầu:
- **Email**: `admin@ecommerce.com`
- **Mật khẩu**: `Admin@123`
*(Bạn có thể thay đổi các giá trị này trong file `.env` trước khi khởi chạy)*

### 📦 Khởi tạo Dữ liệu Cửa hàng Mẫu (Seeding Catalog Data)
Sau khi Docker container khởi chạy thành công, bạn có thể tự động nhập danh mục và sản phẩm mẫu vào cửa hàng bằng cách chạy kịch bản seed dữ liệu tương ứng với hệ điều hành của bạn:

- **Trên Windows (PowerShell)**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File seed-data.ps1
  ```
- **Trên Linux / macOS (Bash Shell)**:
  ```bash
  chmod +x seed-data.sh
  ./seed-data.sh
  ```

---

## 🚀 Tính Năng Nổi Bật Đã Hoàn Thiện

### 🛠️ Giao Diện Quản Trị (Admin Panel)
Hệ thống quản trị đã được nâng cấp đồng bộ theo phong cách **Premium Light Theme** với các tính năng chuyên nghiệp:

1. **Thanh điều hướng Sidebar trái**:
   - Tối ưu hóa không gian hiển thị bằng cách sử dụng Sidebar bên trái cố định, loại bỏ Header trên cùng không cần thiết.
   - Nút **Đăng xuất** được đặt gọn gàng ở cuối Sidebar.
   - Tự động điều hướng trực tiếp vào trang **Doanh thu** (Trang chủ Admin) ngay sau khi đăng nhập thành công bằng quyền Admin.
2. **Quản lý Doanh thu (`admin-revenue.html`)**:
   - Tích hợp thư viện **Chart.js** vẽ biểu đồ doanh thu trực quan theo thời gian (Hôm nay, Tuần này, Tháng này, Năm nay).
   - Thống kê chi tiết: Tổng doanh thu, Số lượng đơn hàng, Sản phẩm bán chạy nhất, Khách hàng mua nhiều nhất.
3. **Quản lý Danh mục (`admin-categories.html`)**:
   - Form thêm danh mục được ẩn mặc định. Nhấp nút **+ Thêm danh mục** ở tiêu đề để bật/tắt form nhanh chóng.
   - Chọn **Sửa** danh mục sẽ tự động mở form và điền sẵn dữ liệu, tự đóng lại khi lưu thành công hoặc hủy bỏ.
4. **Quản lý Sản phẩm (`admin-products.html`)**:
   - Bổ sung cột hiển thị **Ảnh thu nhỏ (Thumbnail)** của sản phẩm dạng bo góc tròn đẹp mắt.
   - Tích hợp **Khung Xem Chi Tiết tại chỗ** ở phần nội dung bên phải cạnh Sidebar (không dùng modal đè màn hình). Thiết kế dạng **2 cột trực quan**: ảnh to nằm bên trái, toàn bộ specs chi tiết (Mã, Danh mục, Giá, Tồn kho, Mô tả) nằm bên phải.
   - Có nút **Quay lại danh sách** tiện lợi.
5. **Quản lý Đơn hàng (`admin-orders.html`)**:
   - **Tự động cập nhật trạng thái**: Loại bỏ hoàn toàn nút "Cập nhật". Khi thay đổi trạng thái trong Dropdown chọn, hệ thống tự động lưu vào database qua API và hiển thị thông báo toast thành công ngay lập tức.
   - Hàng loạt nút hành động được thiết kế dưới dạng liên kết nhỏ gọn (`btn-link`) giúp toàn bộ hàng thông tin luôn thẳng dòng, không bị tự động xuống dòng gây mất thẩm mỹ.
   - Tích hợp **Khung xem chi tiết đơn hàng tại chỗ** cạnh sidebar kèm nút **Quay lại danh sách** và nút **Xoá đơn hàng** (cascade xóa sạch liên kết trong DB).

### 🛍️ Giao Diện Khách Hàng (Storefront)
- Tìm kiếm, lọc sản phẩm theo danh mục và phân trang mượt mà.
- Xem chi tiết sản phẩm và thêm sản phẩm vào giỏ hàng.
- Giỏ hàng tự động cập nhật số lượng badge trên thanh điều hướng, cho phép sửa đổi số lượng và tiến hành đặt hàng.
- **Tiến trình đơn hàng (`order-detail.html`)**:
  - Khung tiến trình (tracker) được đưa lên **trên cùng** của trang chi tiết đơn hàng tạo bố cục cân đối.
  - Tích hợp **biểu tượng SVG hình tròn sinh động** cho các trạng thái (Chờ xử lý, Đã xác nhận, Đang giao, Đã giao, Đã huỷ). Các biểu tượng tự động thay đổi màu sắc nổi bật tương ứng với tiến độ thực tế của đơn hàng.

---

## 📂 Danh Sách Trang Giao Diện

| Trang | Quyền | Mục đích |
|---|---|---|
| `index.html` | Công khai | Danh sách sản phẩm, Tìm kiếm, Lọc danh mục, Phân trang |
| `product.html?id=` | Công khai | Chi tiết sản phẩm, Thêm vào giỏ hàng |
| `login.html` / `register.html` | Công khai | Đăng nhập / Đăng ký tài khoản |
| `cart.html` | Khách hàng | Giỏ hàng, Cập nhật số lượng, Xóa sản phẩm, Đặt hàng |
| `orders.html` | Khách hàng | Lịch sử mua hàng |
| `order-detail.html?id=` | Khách hàng | Xem chi tiết đơn hàng & Tiến trình trạng thái (kèm icon sinh động) |
| `admin-revenue.html` | Admin | Quản lý doanh thu, biểu đồ trực quan (Trang chủ Admin) |
| `admin-categories.html` | Admin | Quản lý danh mục (CRUD) |
| `admin-products.html` | Admin | Quản lý sản phẩm (CRUD, Xem chi tiết 2 cột tại chỗ) |
| `admin-orders.html` | Admin | Quản lý đơn hàng (Đổi trạng thái tự động lưu, Xem chi tiết tại chỗ, Xoá đơn) |

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend
- **Core**: Java 21, Spring Boot 3.3, Spring Data JPA, Spring Security + JWT
- **Database**: MySQL 8
- **Build Tool**: Maven

### Frontend
- HTML5, CSS3, JavaScript ES6 thuần (không sử dụng framework hay công cụ biên dịch phức tạp).
- Phục vụ bằng **Nginx 1.27** trong môi trường Docker.

### Hạ tầng
- **Docker Compose** đóng gói toàn bộ hệ thống.

---

## 📝 Quản Lý API Endpoints

Chi tiết cấu trúc JSON Request/Response, sơ đồ cơ sở dữ liệu ERD và hướng dẫn thiết kế được trình bày chi tiết tại tệp [TECHNICAL_DESIGN_DOCUMENT.md](TECHNICAL_DESIGN_DOCUMENT.md).

---

## 🧪 Chạy Kiểm Thử (Tests)

Kiểm thử tự động cho backend (bao gồm kiểm tra tính hợp lệ của email đăng ký, xử lý đồng thời lượng tồn kho khi đặt hàng):

```bash
mvn test
```
