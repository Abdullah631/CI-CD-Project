import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
// icons removed to simplify UI
import LandingNav from "../components/LandingNav";
import landingImg from "../assets/landing.jpg";

export const SignUpPage = () => {
  // State - unchanged for backend compatibility
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

  // Photo handler - unchanged
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

  // Form submit - unchanged for backend compatibility
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

      <main className="relative z-10 flex items-center justify-center px-6 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-lg">
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
              className="px-8 py-8 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(165, 185, 163, 0.15), rgba(178, 114, 77, 0.1))",
                borderBottom: "1px solid var(--border-strong)",
              }}
            >
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform duration-300 hover:scale-110 hover:rotate-3"
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
                Create Account
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                Join RemoteHire and start your journey
              </p>
            </div>

            {/* Form Section */}
            <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
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
                  <p className="font-medium text-red-600 text-sm">{error}</p>
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
                  <p className="font-medium text-green-600 text-sm">
                    {success}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Selection */}
                <div className="space-y-3">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    I am a...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "candidate",
                        label: "Candidate",
                        desc: "Looking for jobs",
                      },
                      {
                        value: "recruiter",
                        label: "Recruiter",
                        desc: "Hiring talent",
                      },
                    ].map((r) => (
                      <label
                        key={r.value}
                        className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          role === r.value ? "ring-2" : ""
                        }`}
                        style={{
                          background:
                            role === r.value
                              ? "linear-gradient(135deg, rgba(178, 114, 77, 0.15), rgba(165, 185, 163, 0.1))"
                              : "var(--bg)",
                          border: `2px solid ${
                            role === r.value
                              ? "var(--cinnamon)"
                              : "var(--border-strong)"
                          }`,
                          ringColor: "var(--cinnamon)",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={r.value}
                          checked={role === r.value}
                          onChange={(e) => setRole(e.target.value)}
                          className="hidden"
                        />
                        <div className="text-center py-1">
                          <span
                            className="font-semibold block"
                            style={{
                              color:
                                role === r.value
                                  ? "var(--cinnamon)"
                                  : "var(--text-primary)",
                            }}
                          >
                            {r.label}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {r.desc}
                          </span>
                        </div>
                        {role === r.value && (
                          <div
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              background: "var(--cinnamon)",
                              color: "var(--cream)",
                            }}
                          >
                            ✓
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <label
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Profile Photo
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      (Optional)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className="p-6 rounded-xl border-2 border-dashed text-center transition-all duration-300 hover:border-solid hover:scale-[1.01]"
                      style={{
                        borderColor: photoPreview
                          ? "var(--sage)"
                          : "var(--border-strong)",
                        background: photoPreview
                          ? "rgba(165, 185, 163, 0.1)"
                          : "var(--bg)",
                      }}
                    >
                      {photoPreview ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-20 h-20 rounded-full mb-3 object-cover ring-4"
                            style={{ ringColor: "var(--sage)" }}
                          />
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--sage)" }}
                          >
                            ✓ Photo added · Click to change
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                            style={{ background: "rgba(178, 114, 77, 0.1)" }}
                          >
                            <div style={{ fontSize: 24 }}>👤</div>
                          </div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Click or drag to upload
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

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
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full px-4 py-3.5 rounded-xl transition-all duration-300 focus:scale-[1.02] focus:shadow-lg outline-none"
                    style={{
                      background: "var(--bg)",
                      border: "2px solid var(--border-strong)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span style={{ color: "var(--cinnamon)" }}>📧</span>
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
                  <label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span style={{ color: "var(--cinnamon)" }}>🔒</span>
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
                      placeholder="Create a strong password"
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
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-transform duration-200 hover:scale-110 text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span style={{ color: "var(--cinnamon)" }}>🔒</span>
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
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3.5 rounded-xl transition-all duration-300 focus:scale-[1.02] focus:shadow-lg outline-none pr-12"
                      style={{
                        background: "var(--bg)",
                        border: "2px solid var(--border-strong)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-transform duration-200 hover:scale-110 text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {/* Password match indicator */}
                  {confirmPassword && (
                    <p
                      className="text-xs font-medium flex items-center gap-1"
                      style={{
                        color:
                          password === confirmPassword
                            ? "var(--sage)"
                            : "#dc2626",
                      }}
                    >
                      {password === confirmPassword ? (
                        <>✓ Passwords match</>
                      ) : (
                        <>⚠️ Passwords don't match</>
                      )}
                    </p>
                  )}
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
                      Creating Account...
                    </>
                  ) : (
                    <>Create Account</>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div
              className="px-8 py-5 text-center"
              style={{
                background: "rgba(165, 185, 163, 0.08)",
                borderTop: "1px solid var(--border-strong)",
              }}
            >
              <p style={{ color: "var(--text-secondary)" }}>
                Already have an account?{" "}
                <a
                  href="/#/signin"
                  className="font-bold transition-all duration-200 hover:underline"
                  style={{ color: "var(--cinnamon)" }}
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>

          {/* Bottom text */}
          <p
            className="text-center mt-6 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            By creating an account, you agree to our{" "}
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

export default SignUpPage;
