import { useEffect, useState } from "react";
import axios from "axios";

export const GitHubCallbackPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          setError("No authorization code received");
          setLoading(false);
          return;
        }

        // Send code to backend
        const response = await axios.post(
          `${window.API_BASE_URL}/api/auth/github/`,
          {
            code: code,
          }
        );

        if (response.status === 200) {
          // Save user data
          const userData = {
            username: response.data.username,
            role: response.data.role,
            email: response.data.email,
          };
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", response.data.token);

          // Redirect to dashboard
          window.location.href = "/#/dashboard";
        }
      } catch (err) {
        console.error("GitHub OAuth error:", err);
        setError("GitHub authentication failed. Redirecting to sign in...");
        setTimeout(() => {
          window.location.href = "/#/signin";
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-lg text-gray-700">
              Authenticating with GitHub...
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-green-600">
              Authentication successful! Redirecting...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
