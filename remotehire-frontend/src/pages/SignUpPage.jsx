import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Camera } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export const SignUpPage = () => {
  const [role, setRole] = useState("candidate");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (photo) {
        formData.append("photo", photo);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/register/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setSuccess(response.data.message || "Registration successful!");

        setTimeout(() => {
          window.location.href = "/#/signin";
        }, 2000);
      } else {
        setError("Unexpected response from server. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response) {
        if (err.response.status === 400 && err.response.data) {
          const errorObj = err.response.data;
          const errorMessages = Object.values(errorObj).flat().join(", ");
          setError(
            errorMessages || "Registration failed. Please check your input."
          );
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
                ? "bg-purple-600/10 border-slate-700/50"
                : "bg-purple-600/5 border-blue-100/50"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                darkMode ? "bg-purple-600/30" : "bg-purple-100"
              }`}
            >
              <UserPlus
                size={32}
                className={darkMode ? "text-purple-400" : "text-purple-600"}
              />
            </div>
            <h1
              className={`text-4xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Join Us
            </h1>
            <p
              className={`text-sm ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Create your RemoteHire.io account
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                <p className="font-medium text-sm">{error}</p>
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
                <p className="font-medium text-sm">{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  I am a...
                </label>
                <div className="flex gap-3">
                  {["candidate", "recruiter"].map((r) => (
                    <label
                      key={r}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center font-semibold ${
                        role === r
                          ? darkMode
                            ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                            : "border-blue-500 bg-blue-100 text-blue-700"
                          : darkMode
                          ? "border-slate-600/50 bg-slate-700/30 text-slate-400 hover:border-slate-500/50"
                          : "border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={role === r}
                        onChange={(e) => setRole(e.target.value)}
                        className="hidden"
                      />
                      {r === "candidate" ? "👨‍💼 Candidate" : "👔 Recruiter"}
                    </label>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <Camera size={16} />
                  Profile Photo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className={`px-4 py-6 rounded-xl border-2 border-dashed text-center transition-all duration-300 ${
                      darkMode
                        ? "border-slate-600/50 hover:border-indigo-500/50 hover:bg-slate-700/20"
                        : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                  >
                    {photoPreview ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-16 h-16 rounded-full mb-2 object-cover"
                        />
                        <p
                          className={`text-sm font-semibold ${
                            darkMode ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div
                          className={`text-3xl mb-2 ${
                            darkMode ? "text-indigo-400" : "text-blue-600"
                          }`}
                        >
                          📸
                        </div>
                        <p
                          className={`text-sm font-semibold ${
                            darkMode ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          Add your photo
                        </p>
                        <p
                          className={`text-xs ${
                            darkMode ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          (Optional)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <User size={16} />
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

              {/* Email */}
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
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3 rounded-xl transition-all duration-300 border font-medium ${
                    darkMode
                      ? "bg-slate-700/30 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                      : "bg-white border-blue-100 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <Lock size={16} />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <Lock size={16} />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 border font-medium pr-12 ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600/50 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                        : "bg-white border-blue-100 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                      darkMode
                        ? "text-slate-400 hover:text-slate-300"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  darkMode
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/50 border border-purple-500/50"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/30 border border-purple-300/50"
                }`}
              >
                {loading ? "⏳ Creating Account..." : "✨ Create Account"}
              </button>
            </form>
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
              Already have an account?{" "}
              <a
                href="/#/signin"
                className={`font-bold hover:underline ${
                  darkMode ? "text-indigo-400" : "text-blue-600"
                }`}
              >
                Sign in
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

      <style>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: ${darkMode ? "#4f46e5" : "#3b82f6"};
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default SignUpPage;
