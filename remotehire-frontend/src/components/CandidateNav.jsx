import React, { useState } from "react";
import { Zap, Menu, X, LogOut, Settings } from "lucide-react";

/**
 * Navbar for candidate pages.
 * Props:
 * - darkMode: boolean controlling theme styles
 * - onToggleDarkMode: function to toggle dark mode (should also update localStorage)
 * - userName: string with candidate's name
 * - currentPage: string indicating which page is active (e.g., 'dashboard', 'details', 'interviews', 'profile', 'findjobs')
 */
export const CandidateNav = ({
  darkMode,
  onToggleDarkMode,
  userName,
  currentPage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/#/candidate-dashboard", id: "dashboard" },
    { label: "Find Jobs", path: "/#/find-jobs", id: "findjobs" },
    { label: "Interviews", path: "/#/candidate-interviews", id: "interviews" },
    { label: "Profile", path: "/#/profile", id: "profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/#/";
  };

  return (
    <nav
      className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-all duration-300 ${
        darkMode
          ? "bg-slate-800/80 border-slate-700/50"
          : "bg-white/80 border-blue-100/50"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <div
              className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                darkMode ? "bg-indigo-600/20" : "bg-blue-100"
              }`}
            >
              <Zap
                size={24}
                className={darkMode ? "text-indigo-400" : "text-blue-600"}
              />
            </div>
            <span
              className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              <a href="/#/">RemoteHire.io</a>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.path}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  currentPage === item.id
                    ? darkMode
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/50"
                      : "bg-blue-100 text-blue-600 border border-blue-200"
                    : darkMode
                    ? "text-slate-300 hover:text-white hover:bg-slate-700/30"
                    : "text-slate-700 hover:text-slate-900 hover:bg-blue-50"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              aria-label="Toggle dark mode"
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 border ${
                darkMode
                  ? "bg-slate-700/40 border-slate-600/50 text-yellow-300 hover:bg-slate-700/60"
                  : "bg-white/70 border-blue-100 text-slate-700 hover:bg-white"
              }`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {/* User Info & Settings */}
            <div className="hidden sm:flex items-center gap-3">
              {userName && (
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                    darkMode
                      ? "bg-slate-700/40 border-slate-600/50 text-indigo-400 hover:bg-slate-700/60"
                      : "bg-white/70 border-blue-100 text-slate-700 hover:bg-white"
                  }`}
                >
                  {userName}
                </span>
              )}
              <button
                title="Settings"
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode
                    ? "bg-slate-700/40 border-slate-600/50 text-indigo-400 hover:bg-slate-700/60"
                    : "bg-white/70 border-blue-100 text-slate-700 hover:bg-white"
                }`}
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                title="Logout"
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode
                    ? "bg-slate-700/40 border-slate-600/50 text-red-300 hover:bg-slate-700/60"
                    : "bg-white/70 border-blue-100 text-slate-700 hover:bg-white"
                }`}
              >
                <LogOut size={20} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-all duration-300 ${
                darkMode
                  ? "text-slate-300 hover:bg-slate-700/40"
                  : "text-slate-700 hover:bg-blue-50"
              }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.path}
                className={`block px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  currentPage === item.id
                    ? darkMode
                      ? "bg-indigo-600/20 text-indigo-400"
                      : "bg-blue-100 text-blue-600"
                    : darkMode
                    ? "text-slate-300 hover:text-white hover:bg-slate-700/30"
                    : "text-slate-700 hover:text-slate-900 hover:bg-blue-50"
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-slate-600/30 pt-2 mt-2">
              <button
                onClick={handleLogout}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  darkMode
                    ? "text-red-400 hover:text-red-300 hover:bg-red-600/20"
                    : "text-red-600 hover:text-red-700 hover:bg-red-50"
                }`}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default CandidateNav;
