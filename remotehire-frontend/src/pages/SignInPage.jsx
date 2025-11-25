import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleIcon, GitHubIcon } from "../components/Icons";

export const SignInPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password,
      });

      // Check if login was successful
      if (response.status === 200) {
        setSuccess(response.data.message || "Login successful!");

        // Reset form
        setUsername("");
        setPassword("");

        // Redirect after successful login
        // Save user data to localStorage
        const userData = {
          username: username,
          role: response.data.role || "candidate",
        };
        localStorage.setItem("user", JSON.stringify(userData));
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        // Redirect after successful login
        setTimeout(() => {
          window.location.href = "/#/dashboard";
        }, 1000);
      }
    } catch (err) {
      // Handle error responses from the API
      console.error("Login error:", err);

      if (err.response) {
        // Server responded with error status
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

  useEffect(() => {
    // If backend redirected back with token in the hash (e.g. #/signin?token=..), capture it
    try {
      const hash = window.location.hash || '';
      const parts = hash.split('?');
      if (parts.length > 1) {
        const params = new URLSearchParams(parts[1]);
        const token = params.get('token');
        const username = params.get('username');
        const role = params.get('role');
        if (token) {
          // persist and navigate to dashboard
          localStorage.setItem('token', token);
          const userData = { username: username || 'user', role: role || 'candidate' };
          localStorage.setItem('user', JSON.stringify(userData));
          // Remove token params from hash to avoid leakage
          window.location.hash = '/#/dashboard';
          window.location.href = '/#/dashboard';
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>
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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label
                htmlFor="email-address"
                className="font-medium text-gray-700 text-sm"
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
                className="appearance-none rounded-md relative block w-full px-3 py-2 
bg-white text-black placeholder-gray-400 
border border-gray-300 
focus:outline-none focus:ring-blue-500 focus:border-blue-500 
focus:z-10 sm:text-sm mt-1"
                placeholder="your_username"
              />
            </div>
            <div className="pt-4">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="font-medium text-gray-700 text-sm"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 
bg-white text-black placeholder-gray-400 
border border-gray-300 
focus:outline-none focus:ring-blue-500 focus:border-blue-500 
focus:z-10 sm:text-sm mt-1"

              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-sm text-gray-500">
            OR CONTINUE WITH
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { window.location.href = 'http://127.0.0.1:8000/api/auth/google/login/'; }}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <GoogleIcon /> Google
          </button>
          <button
            onClick={() => { window.location.href = 'http://127.0.0.1:8000/api/auth/github/login/'; }}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <GitHubIcon /> GitHub
          </button>
        </div>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/#/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};
