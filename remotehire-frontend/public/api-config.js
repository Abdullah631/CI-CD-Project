// Global API base URL configuration
window.API_BASE_URL = (() => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  return isLocalhost
    ? "http://127.0.0.1:8000"
    : `http://${window.location.hostname}:8000`;
})();

console.log("Global API URL:", window.API_BASE_URL);
