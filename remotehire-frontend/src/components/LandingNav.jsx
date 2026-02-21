import React from "react";
import { Zap } from "lucide-react";

/**
 * Navbar styled like the LandingPage header.
 * Props:
 * - darkMode: boolean controlling theme styles
 * - onToggleDarkMode: function to toggle dark mode (should also update localStorage)
 */
export const LandingNav = ({ darkMode, onToggleDarkMode }) => {
  return (
    <nav
      className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-all duration-300 ${
        darkMode
          ? "bg-slate-800/80 border-slate-700/50"
          : "bg-white/80 border-blue-100/50"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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
        <div className="flex items-center gap-4">
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
          <a
            href="/#/signin"
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
              darkMode
                ? "text-slate-300 hover:text-white"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            Sign In
          </a>
          <a
            href="/#/signup"
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 
    text-white hover:text-white active:text-white ${
      darkMode
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 border border-blue-300/50"
    }`}
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
