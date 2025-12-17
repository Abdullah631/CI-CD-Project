import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ErrorBoundary from "./components/ErrorBoundary";

const container = document.getElementById("root");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <ErrorBoundary>
      <GoogleOAuthProvider clientId="165465955106-pal4aq9gfvl2ud8hsn9qslc0af82gn8s.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}
