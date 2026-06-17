const Auth = {
  TOKEN_KEY: "stockroom_token",
  USER_KEY: "stockroom_user",

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getUser();
    return !!user && user.role === "ADMIN";
  },

  setSession(authResponse) {
    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = "index.html";
  },

  // Redirects to login if the visitor is not signed in, remembering where
  // to send them back to afterwards.
  requireLogin() {
    if (!this.isLoggedIn()) {
      const here = window.location.pathname.split("/").pop() + window.location.search;
      window.location.href = "login.html?redirect=" + encodeURIComponent(here);
      return false;
    }
    return true;
  },

  // Redirects non-admins back to the catalog. Customers should never see
  // an empty admin shell, so this fails closed.
  requireAdmin() {
    if (!this.isLoggedIn() || !this.isAdmin()) {
      window.location.href = "index.html";
      return false;
    }
    return true;
  },
};
