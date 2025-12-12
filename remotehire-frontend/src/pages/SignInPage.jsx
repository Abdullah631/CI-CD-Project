import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export const SignInPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
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
      setError("Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  const handleGoogleButtonClick = () => {
    // Find and click the hidden Google button
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
      className={`min-h-screen transition-colors duration-300 flex items-center justify-center px-4 py-12 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl ${
            darkMode ? "bg-indigo-600" : "bg-blue-600"
          }`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl ${
            darkMode ? "bg-purple-600" : "bg-indigo-600"
          }`}
        ></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10">
        <div
          className={`rounded-3xl border backdrop-blur transition-all duration-300 shadow-2xl overflow-hidden ${
            darkMode
              ? "bg-slate-800/40 border-slate-700/50"
              : "bg-white/80 border-blue-100/50"
          }`}
        >
          {/* Header */}
          <div
            className={`px-8 py-12 text-center border-b transition-all duration-300 ${
              darkMode
                ? "bg-indigo-600/10 border-slate-700/50"
                : "bg-blue-600/5 border-blue-100/50"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                darkMode ? "bg-indigo-600/30" : "bg-blue-100"
              }`}
            >
              <LogIn
                size={32}
                className={darkMode ? "text-indigo-400" : "text-blue-600"}
              />
            </div>
            <h1
              className={`text-4xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Welcome Back
            </h1>
            <p
              className={`text-sm ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Sign in to your RemoteHire.io account
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Messages */}
            {error && (
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  darkMode
                    ? "bg-red-500/10 border-red-500/30 text-red-300"
                    : "bg-red-50/80 border-red-200 text-red-700"
                }`}
              >
                <span className="text-xl mt-0.5">⚠️</span>
                <p className="font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  darkMode
                    ? "bg-green-500/10 border-green-500/30 text-green-300"
                    : "bg-green-50/80 border-green-200 text-green-700"
                }`}
              >
                <span className="text-xl mt-0.5">✅</span>
                <p className="font-medium">{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <Mail size={16} />
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 border font-medium ${
                    darkMode
                      ? "bg-slate-700/30 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                      : "bg-white border-blue-100 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className={`text-sm font-semibold flex items-center gap-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    <Lock size={16} />
                    Password
                  </label>
                  <a
                    href="#"
                    className={`text-xs font-semibold hover:underline ${
                      darkMode ? "text-indigo-400" : "text-blue-600"
                    }`}
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 border font-medium pr-12 ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                        : "bg-white border-blue-100 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                      darkMode
                        ? "text-slate-400 hover:text-slate-300"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  darkMode
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 border border-blue-300/50"
                }`}
              >
                {loading ? "⏳ Signing in..." : "🚀 Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div
                className={`flex-1 h-px ${
                  darkMode ? "bg-slate-700/30" : "bg-blue-100/50"
                }`}
              ></div>
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Or continue with
              </span>
              <div
                className={`flex-1 h-px ${
                  darkMode ? "bg-slate-700/30" : "bg-blue-100/50"
                }`}
              ></div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              {/* Google Login - Hidden actual button with custom styled trigger */}
              <div>
                {/* Hidden Google Login Button */}
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
                {/* Custom Styled Button */}
                <button
                  onClick={handleGoogleButtonClick}
                  className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 border transform hover:scale-105 active:scale-95 ${
                    darkMode
                      ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      : "bg-white border-blue-200 text-slate-900 hover:bg-blue-50 shadow-md"
                  }`}
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
                  Google
                </button>
              </div>

              <button
                onClick={handleGitHubLogin}
                className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 border transform hover:scale-105 active:scale-95 ${
                  darkMode
                    ? "bg-slate-700/30 border-slate-600/50 text-slate-200 hover:bg-slate-700/50"
                    : "bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
              <button
                onClick={handleLinkedInLogin}
                className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 border transform hover:scale-105 active:scale-95 ${
                  darkMode
                    ? "bg-blue-900/30 border-blue-600/50 text-blue-300 hover:bg-blue-900/50"
                    : "bg-blue-100 border-blue-200 text-blue-900 hover:bg-blue-200"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.25-.129.599-.129.948v5.419h-3.554s.05-8.736 0-9.646h3.554v1.364c.425-.654 1.185-1.586 2.882-1.586 2.105 0 3.684 1.375 3.684 4.331v5.537zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.706 0-.951.77-1.706 1.959-1.706 1.188 0 1.915.755 1.938 1.706 0 .948-.75 1.706-1.982 1.706zm1.581 11.597H3.715V9.806h3.203v10.646zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
                LinkedIn
              </button>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`px-8 py-6 text-center border-t transition-all duration-300 ${
              darkMode
                ? "bg-slate-800/30 border-slate-700/50"
                : "bg-blue-50/30 border-blue-100/50"
            }`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Don't have an account?{" "}
              <a
                href="/#/signup"
                className={`font-bold hover:underline ${
                  darkMode ? "text-indigo-400" : "text-blue-600"
                }`}
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => {
            setDarkMode(!darkMode);
            localStorage.setItem("darkMode", !darkMode);
          }}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
            darkMode
              ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
              : "bg-white/60 hover:bg-white text-slate-600"
          }`}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
};

export default SignInPage;
