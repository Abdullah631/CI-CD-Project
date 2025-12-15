import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { Mail, ArrowLeft, Send } from "lucide-react";
import LandingNav from "../components/LandingNav";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResetUrl("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/password/forgot/`, {
        email,
      });
      setSuccess(
        response.data?.message ||
          "If an account exists for that email, a reset link has been sent."
      );
      // In development, show the reset URL directly
      if (response.data?.reset_url) {
        setResetUrl(response.data.reset_url);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to send reset link. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      <LandingNav
        darkMode={darkMode}
        onToggleDarkMode={() => {
          setDarkMode(!darkMode);
          localStorage.setItem("darkMode", !darkMode);
        }}
      />

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

      <div className="relative flex items-center justify-center px-4 py-12 z-10 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <div
            className={`rounded-3xl border backdrop-blur transition-all duration-300 shadow-2xl overflow-hidden ${
              darkMode
                ? "bg-slate-800/40 border-slate-700/50"
                : "bg-white/80 border-blue-100/50"
            }`}
          >
            <div
              className={`px-8 py-10 text-center border-b transition-all duration-300 ${
                darkMode
                  ? "bg-indigo-600/10 border-slate-700/50"
                  : "bg-blue-600/5 border-blue-100/50"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                  darkMode ? "bg-indigo-600/30" : "bg-blue-100"
                }`}
              >
                <Send
                  size={28}
                  className={darkMode ? "text-indigo-400" : "text-blue-600"}
                />
              </div>
              <h1
                className={`text-3xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Forgot password?
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Enter your email and we will send you a reset link.
              </p>
            </div>

            <div className="p-8 space-y-6">
              {error && (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    darkMode
                      ? "bg-red-500/10 border-red-500/30 text-red-300"
                      : "bg-red-50/80 border-red-200 text-red-700"
                  }`}
                >
                  <span className="text-xl mt-0.5">⚠️</span>
                  <p className="font-medium text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div
                  className={`p-4 rounded-2xl border flex-col gap-3 ${
                    darkMode
                      ? "bg-green-500/10 border-green-500/30 text-green-300"
                      : "bg-green-50/80 border-green-200 text-green-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">✅</span>
                    <p className="font-medium text-sm">{success}</p>
                  </div>
                  {resetUrl && (
                    <div className="mt-3 pt-3 border-t border-current/20">
                      <p className="text-xs font-semibold mb-2">Development mode - Click to reset:</p>
                      <a
                        href={resetUrl}
                        className={`text-xs break-all hover:underline font-mono ${
                          darkMode ? "text-green-200" : "text-green-800"
                        }`}
                      >
                        {resetUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 border font-medium ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                        : "bg-white border-blue-100 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    darkMode
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 border border-blue-300/50"
                  }`}
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <div className="text-center">
                <a
                  href="/#/signin"
                  className={`inline-flex items-center gap-2 text-sm font-semibold hover:underline ${
                    darkMode ? "text-indigo-300" : "text-blue-600"
                  }`}
                >
                  <ArrowLeft size={16} />
                  Back to sign in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
