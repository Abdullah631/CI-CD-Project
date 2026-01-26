// Global API base URL configuration
// This file is loaded in index.html and provides a fallback API URL
// The main config is in src/config.js which takes precedence
window.API_BASE_URL = (() => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Determine API URL based on environment
  if (isLocalhost) {
    return "http://127.0.0.1:8000";
  } else if (window.location.hostname.includes("onrender.com")) {
    // Render deployment - use Render backend
    return "https://remotehire-io-1.onrender.com";
  } else if (window.location.hostname.includes("vercel.app")) {
    // Vercel deployment - use Render backend
    return "https://remotehire-io-1.onrender.com";
  } else if (window.location.hostname.includes("azurewebsites.net")) {
    // Azure deployment
    return `https://${window.location.hostname.replace("-frontend", "-backend")}.azurewebsites.net`;
  } else {
    // Fallback for other deployments - use Render
    return "https://remotehire-io-1.onrender.com";
  }
})();

console.log("RemoteHire Global API URL:", window.API_BASE_URL);

