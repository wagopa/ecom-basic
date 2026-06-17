async function apiRequest(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = (typeof Auth !== "undefined" && Auth) ? Auth.getToken() : null;
  if (token) headers["Authorization"] = "Bearer " + token;

  let response;
  try {
    response = await fetch(window.API_BASE_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    const err = new Error(
      "Không thể kết nối tới máy chủ (API) tại " + window.API_BASE_URL + ". Vui lòng kiểm tra xem backend đã được khởi động chưa."
    );
    err.status = 0;
    throw err;
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      data = null;
    }
  }

  if (!response.ok) {
    const message = (data && data.message) || `Request failed (HTTP ${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.errors = data && data.errors;
    throw err;
  }

  return data;
}

const Api = {
  get: (path) => apiRequest("GET", path),
  post: (path, body) => apiRequest("POST", path, body),
  put: (path, body) => apiRequest("PUT", path, body),
  patch: (path, body) => apiRequest("PATCH", path, body),
  del: (path) => apiRequest("DELETE", path),
};
