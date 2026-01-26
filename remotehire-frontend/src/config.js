// API Configuration - Works on both local and live environments

const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "127.0.0.1:5173";

// Determine API URL based on environment
let API_BASE_URL;

if (isLocalHost) {
  // Local development - use localhost:8000
  API_BASE_URL = "http://127.0.0.1:8000";
} else if (window.location.hostname.includes("onrender.com")) {
  // Render deployment - use Render backend
  API_BASE_URL = "https://remotehire-io-1.onrender.com";
} else if (window.location.hostname.includes("vercel.app")) {
  // Vercel deployment - use Render backend
  API_BASE_URL = "https://remotehire-io-1.onrender.com";
} else if (window.location.hostname.includes("azurewebsites.net")) {
  // Azure deployment - use Azure backend
  API_BASE_URL = `https://${window.location.hostname.replace("-frontend", "-backend")}.azurewebsites.net`;
} else {
  // Fallback for other deployments - use Render
  API_BASE_URL = "https://remotehire-io-1.onrender.com";
}

// Allow override via environment variable or window variable
const FINAL_API_URL =
  window.API_BASE_URL || process.env.VITE_API_URL || API_BASE_URL;

console.log("RemoteHire API Configuration:", {
  hostname: window.location.hostname,
  isLocal: isLocalHost,
  environment: isLocalHost ? "LOCAL" : "PRODUCTION",
  apiUrl: FINAL_API_URL,
});

// Export with multiple names for maximum compatibility
export { FINAL_API_URL, API_BASE_URL };
export const API_BASE_URL_FINAL = FINAL_API_URL;
export default FINAL_API_URL;
