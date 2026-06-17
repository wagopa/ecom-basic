document.addEventListener("DOMContentLoaded", () => {
  if (Auth.isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("register-error");
    errorEl.textContent = "";

    const phone = document.getElementById("phone").value.trim();
    const payload = {
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      phone: phone || null,
    };

    try {
      await Api.post("/auth/register", payload);
      Utils.toast("Tạo tài khoản thành công. Vui lòng đăng nhập.", "success");
      window.location.href = "login.html";
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
});
