import React from "react";
import { LogoIcon, SunIcon, MoonIcon } from "./Icons";

export const Header = ({ darkMode, toggleDarkMode }) => {
  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    storedUser = raw ? JSON.parse(raw) : null;
  } catch (e) {
    storedUser = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/#/signin";
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <a href="/#" className="flex items-center space-x-2">
              <LogoIcon />
              <span className="font-bold text-xl text-gray-800">
                RemoteHire.io
              </span>
            </a>
            <nav className="hidden md:flex items-center space-x-4">
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Features
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                How It Works
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Pricing
              </a>
              <a
                href="#/find-jobs"
                className="ml-2 inline-flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1011.5 19.5a7.5 7.5 0 005.15-2.85z" />
                </svg>
                <span className="text-sm font-medium">Find Jobs</span>
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button
              aria-label="Toggle theme"
              onClick={() => {
                if (typeof toggleDarkMode === 'function') return toggleDarkMode();
                // fallback: emit a custom event so a global listener can toggle
                window.dispatchEvent(new CustomEvent('toggleTheme'));
              }}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              {darkMode ? <MoonIcon /> : <SunIcon />}
            </button>
            {storedUser ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">
                  {storedUser.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <a
                  href="/#/signin"
                  className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2"
                >
                  Sign in
                </a>
                <a
                  href="/#/signup"
                  className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
