// API Configuration - automatically uses localhost or network IP
// No manual configuration needed!

// Use global API_BASE_URL if available (set in index.html)
// Otherwise calculate it here
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE_URL =
  window.API_BASE_URL ||
  (isLocalhost
    ? "http://127.0.0.1:8000"
    : `http://${window.location.hostname}:8000`);

console.log("API URL:", API_BASE_URL);
