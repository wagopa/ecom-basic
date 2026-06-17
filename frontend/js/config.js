// Default API base URL — works out of the box when this file is opened
// directly in a browser (file://) or served by any static server, as long
// as the backend is reachable at localhost:8080. When running via
// docker-compose, the entrypoint script overwrites this file using the
// API_BASE_URL environment variable if one is provided.
window.API_BASE_URL = "http://localhost:8080/api";
