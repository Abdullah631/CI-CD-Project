import React, { useState } from "react";
import axios from "axios";
import { GoogleIcon, GitHubIcon } from "../components/Icons";

export const SignUpPage = () => {
  const [role, setRole] = useState("candidate");
  const [photo, setPhoto] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Create FormData to send files
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (photo) {
        formData.append("photo", photo);
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Display success message from response
      // Check if response status is 201 (data saved successfully)
      if (response.status === 201) {
        setSuccess(response.data.message || "Registration successful!");

        // Reset form
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPhoto(null);
        setRole("candidate");

        // Redirect after successful registration
        setTimeout(() => {
          window.location.href = "/#/signin";
        }, 2000);
      } else {
        // If status is not 201, show generic error
        setError("Unexpected response from server. Please try again.");
      }
    } catch (err) {
      // Handle error responses from the API
      console.error("Registration error:", err);

      if (err.response) {
        // Server responded with error status
        if (err.response.status === 400 && err.response.data) {
          // Serializer validation errors - display field errors
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
        // Request made but no response
        setError("No response from server. Please check your connection.");
      } else {
        // Error in request setup
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your role and get started with RemoteHire.io
          </p>
        </div>
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-900">I am a</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole("candidate")}
                className={`p-4 text-left rounded-lg border ${
                  role === "candidate"
                    ? "border-blue-600 ring-2 ring-blue-200"
                    : "border-gray-300"
                }`}
              >
                <div
                  className={`font-semibold ${
                    role === "candidate" ? "text-blue-600" : "text-gray-800"
                  }`}
                >
                  Candidate
                </div>
                <div className="text-sm text-gray-500">Looking for jobs</div>
              </button>
              <button
                onClick={() => setRole("recruiter")}
                className={`p-4 text-left rounded-lg border ${
                  role === "recruiter"
                    ? "border-blue-600 ring-2 ring-blue-200"
                    : "border-gray-300"
                }`}
              >
                <div
                  className={`font-semibold ${
                    role === "recruiter" ? "text-blue-600" : "text-gray-800"
                  }`}
                >
                  Recruiter
                </div>
                <div className="text-sm text-gray-500">Hiring talent</div>
              </button>
            </div>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="full-name"
                className="font-medium text-gray-700 text-sm"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="name"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label
                htmlFor="email-address-signup"
                className="font-medium text-gray-700 text-sm"
              >
                Email
              </label>
              <input
                id="email-address-signup"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password-signup"
                className="font-medium text-gray-700 text-sm"
              >
                Password
              </label>
              <input
                id="password-signup"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="font-medium text-gray-700 text-sm"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="photo"
                className="font-medium text-gray-700 text-sm"
              >
                Profile Photo
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
              />
              {photo && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {photo.name}
                </p>
              )}
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group mt-4 relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-sm text-gray-500">
              OR CONTINUE WITH
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <GoogleIcon /> Google
            </button>
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              <GitHubIcon /> GitHub
            </button>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/#/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
