document.addEventListener("DOMContentLoaded", () => {
  if (Auth.isLoggedIn()) {
    window.location.href = Auth.isAdmin() ? "admin-revenue.html" : "index.html";
    return;
  }

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("login-error");
    errorEl.textContent = "";

    try {
      const res = await Api.post("/auth/login", { email, password });
      Auth.setSession(res);
      const redirect = Utils.qs("redirect");
      if (Auth.isAdmin()) {
        window.location.href = (redirect && redirect !== "index.html") ? decodeURIComponent(redirect) : "admin-revenue.html";
      } else {
        window.location.href = redirect ? decodeURIComponent(redirect) : "index.html";
      }
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
});
