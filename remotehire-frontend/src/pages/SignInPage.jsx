import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// icons removed to simplify UI
import { GoogleLogin } from "@react-oauth/google";
import LandingNav from "../components/LandingNav";
import landingImg from "../assets/landing.jpg";
import { API_BASE_URL } from "../config";

export const SignInPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const googleButtonRef = useRef(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/google/`, {
        token: credentialResponse.credential,
      });

      if (response.status === 200) {
        const userData = {
          username: response.data.username,
          role: response.data.role,
          email: response.data.email,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", response.data.token);

        setSuccess("Login successful with Google!");
        setTimeout(() => {
          window.location.href = "/#/dashboard";
        }, 500);
      }
    } catch (err) {
      console.error("Google OAuth error:", err);
      // Prefer backend-provided messages when available to help debugging
      const serverMessage =
        err?.response?.data?.error || err?.response?.data?.message;
      if (serverMessage) {
        setError(`Google login failed: ${serverMessage}`);
      } else if (err?.message) {
        setError(`Google login failed: ${err.message}`);
      } else {
        setError("Google login failed. Please try again.");
      }
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  const handleGoogleButtonClick = () => {
    const googleBtn =
      googleButtonRef.current?.querySelector('div[role="button"]');
    if (googleBtn) {
      googleBtn.click();
    }
  };

  const handleGitHubLogin = () => {
    const clientId = "Ov23liS7rIQLKWahn5Cy";
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  const handleLinkedInLogin = () => {
    const clientId = "77o2h1w1tfkfni";
    const redirectUri = `${window.location.origin}/auth/linkedin/callback`;
    const scope = "openid profile email";
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}`;
    window.location.href = linkedinAuthUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login/`, {
        username,
        password,
      });

      if (response.status === 200) {
        setSuccess(response.data.message || "Login successful!");
        setUsername("");
        setPassword("");

        const userData = {
          username: username,
          role: response.data.role || "candidate",
        };
        localStorage.setItem("user", JSON.stringify(userData));
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        setTimeout(() => {
          window.location.href = "/#/dashboard";
        }, 1000);
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          setError(err.response.data.error || "Invalid username or password");
        } else if (err.response.data?.error) {
          setError(err.response.data.error);
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError(
            `Error: ${err.response.status} - ${err.response.statusText}`
          );
        }
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const hash = window.location.hash || "";
      const parts = hash.split("?");
      if (parts.length > 1) {
        const params = new URLSearchParams(parts[1]);
        const token = params.get("token");
        const username = params.get("username");
        const role = params.get("role");
        if (token) {
          localStorage.setItem("token", token);
          const userData = {
            username: username || "user",
            role: role || "candidate",
          };
          localStorage.setItem("user", JSON.stringify(userData));
          window.location.hash = "/#/dashboard";
          window.location.href = "/#/dashboard";
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${landingImg})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--sage) 0%, transparent 70%)",
            filter: "blur(60px)",
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute top-1/2 -left-40 w-80 h-80 rounded-full opacity-25 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--cinnamon) 0%, transparent 70%)",
            filter: "blur(60px)",
            animationDuration: "5s",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute -bottom-20 right-1/3 w-72 h-72 rounded-full opacity-20 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--tan) 0%, transparent 70%)",
            filter: "blur(60px)",
            animationDuration: "6s",
            animationDelay: "2s",
          }}
        />
      </div>

      <LandingNav />

      <main className="relative z-10 flex items-center justify-center px-6 py-16 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Card */}
          <div
            className="rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl"
            style={{
              background:
                "linear-gradient(145deg, var(--surface-0), var(--surface-1))",
              border: "1px solid var(--border-strong)",
              boxShadow: "0 25px 50px rgba(36, 26, 15, 0.15)",
            }}
          >
            {/* Header */}
            <div
              className="px-8 py-10 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(165, 185, 163, 0.15), rgba(178, 114, 77, 0.1))",
                borderBottom: "1px solid var(--border-strong)",
              }}
            >
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300 hover:scale-110 hover:rotate-3"
                style={{
                  background:
                    "linear-gradient(135deg, var(--cinnamon), var(--sage))",
                  boxShadow: "0 10px 30px rgba(178, 114, 77, 0.3)",
                }}
              >
                {/* logo area */}
              </div>

              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Welcome Back
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                Sign in to continue to RemoteHire
              </p>
            </div>

            {/* Form Section */}
            <div className="p-8 space-y-6">
              {/* Error Message */}
              {error && (
                <div
                  className="p-4 rounded-xl flex items-start gap-3 animate-pulse"
                  style={{
                    background: "rgba(220, 38, 38, 0.1)",
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                  }}
                >
                  <span className="text-xl">⚠️</span>
                  <p className="font-medium text-red-600">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div
                  className="p-4 rounded-xl flex items-start gap-3"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                  }}
                >
                  <span className="text-xl">✅</span>
                  <p className="font-medium text-green-600">{success}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3.5 rounded-xl transition-all duration-300 focus:scale-[1.02] focus:shadow-lg outline-none"
                    style={{
                      background: "var(--bg)",
                      border: "2px solid var(--border-strong)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="flex items-center gap-2 text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs font-semibold transition-colors duration-200 hover:underline"
                      style={{ color: "var(--cinnamon)" }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 rounded-xl transition-all duration-300 focus:scale-[1.02] focus:shadow-lg outline-none pr-12"
                      style={{
                        background: "var(--bg)",
                        border: "2px solid var(--border-strong)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-transform duration-200 hover:scale-110"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--cinnamon), var(--sage))",
                    color: "var(--cream)",
                    boxShadow: "0 10px 30px rgba(178, 114, 77, 0.3)",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>Sign In</>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--border-stronger)" }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Or continue with
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--border-stronger)" }}
                />
              </div>
              <h1 className="text-4xl font-bold mb-2 text-slate-900">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-600">
                Sign in to your RemoteHire.io account
              </p>
            </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {/* Google */}
                <div>
                  <div
                    ref={googleButtonRef}
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                  </div>
                  <button
                    onClick={handleGoogleButtonClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{
                      background: "var(--bg)",
                      border: "2px solid var(--border-strong)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </button>
                </div>

                {/* GitHub */}
                <button
                  onClick={handleGitHubLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    background: "var(--bg)",
                    border: "2px solid var(--border-strong)",
                    color: "var(--text-primary)",
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={handleLinkedInLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    background: "var(--bg)",
                    border: "2px solid var(--border-strong)",
                    color: "var(--text-primary)",
                  }}
                >
                  <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.25-.129.599-.129.948v5.419h-3.554s.05-8.736 0-9.646h3.554v1.364c.425-.654 1.185-1.586 2.882-1.586 2.105 0 3.684 1.375 3.684 4.331v5.537zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.706 0-.951.77-1.706 1.959-1.706 1.188 0 1.915.755 1.938 1.706 0 .948-.75 1.706-1.982 1.706zm1.581 11.597H3.715V9.806h3.203v10.646zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                  </svg>
                </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-blue-100/50"></div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Or continue with
                </span>
                <div className="flex-1 h-px bg-blue-100/50"></div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-8 py-6 text-center"
              style={{
                background: "rgba(165, 185, 163, 0.08)",
                borderTop: "1px solid var(--border-strong)",
              }}
            >
              <p style={{ color: "var(--text-secondary)" }}>
                Don't have an account?{" "}
                <a
                  href="/#/signup"
                  className="font-bold transition-all duration-200 hover:underline"
                  style={{ color: "var(--cinnamon)" }}
                >
                  Sign up for free
                </a>
              </p>
            </div>
          </div>

          {/* Bottom text */}
          <p
            className="text-center mt-8 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="underline hover:no-underline"
              style={{ color: "var(--cinnamon)" }}
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline hover:no-underline"
              style={{ color: "var(--cinnamon)" }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignInPage;
