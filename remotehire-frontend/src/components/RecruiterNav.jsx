import React, { useState } from "react";
import BoltIcon from "@mui/icons-material/Bolt";

/**
 * Navbar for recruiter pages.
 * Props:
 * - userName: string with recruiter's name
 * - currentPage: string indicating which page is active (e.g., 'candidates', 'interviews', 'analytics', 'jobs')
 */
export const RecruiterNav = ({ userName, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      path: "/#/dashboard",
      id: "dashboard",
    },
    { label: "Job Posts", path: "/#/job-posts", id: "jobs" },
    { label: "Candidates", path: "/#/recruiter-candidates", id: "candidates" },
    { label: "Interviews", path: "/#/recruiter-interviews", id: "interviews" },
    { label: "Analytics", path: "/#/recruiter-analytics", id: "analytics" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/#/";
  };

  return (
    <nav
      className="sticky top-0 z-40"
      style={{
        background:
          "linear-gradient(180deg, rgba(249,245,240,0.9), rgba(244,239,222,0.85))",
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: "linear-gradient(135deg,#b2724d,#a5b9a3)" }}
            >
              <BoltIcon style={{ fontSize: 22, color: "#fff" }} />
            </div>
            <a
              href="/#/"
              className="text-lg font-bold text-[var(--text-primary)]"
            >
              RemoteHire.io
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <a
                  key={item.id}
                  href={item.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, var(--cinnamon), var(--sage))"
                      : "transparent",
                    color: isActive ? "var(--cream)" : "var(--text-primary)",
                    border: isActive ? "none" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--surface-0)";
                      e.currentTarget.style.border =
                        "1px solid var(--border-strong)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.border = "1px solid transparent";
                    }
                  }}
                >
                  {/* icon removed to simplify UI */}
                  {item.label}
                </a>
              );
            })}
            {/* Persistent logout visible in main nav for clarity */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 text-red-600 border border-transparent hover:bg-red-50"
              style={{ background: "transparent" }}
            >
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              {userName && (
                <span
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ background: "rgba(165,185,163,0.12)" }}
                >
                  {userName}
                </span>
              )}
              <button
                title="Settings"
                className="p-2 rounded-lg bg-[var(--surface-1)]"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                title="Logout"
                className="px-3 py-2 rounded-lg text-red-600 border border-red-200 bg-red-50 flex items-center gap-2"
              >
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>

            {/* small-screen logout (visible when header actions are hidden) */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="sm:hidden p-2 rounded-lg text-red-600 border border-red-200 bg-red-50 mr-2"
            >
              Logout
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg"
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 space-y-2 pb-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.path}
                className={
                  currentPage === item.id
                    ? "block px-4 py-2 rounded-md bg-[var(--cinnamon)] text-[var(--cream)] font-semibold"
                    : "block px-4 py-2 rounded-md text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
                }
              >
                {item.label}
              </a>
            ))}
            <div
              style={{
                borderTop: "1px solid var(--border-strong)",
                paddingTop: "0.5rem",
              }}
            >
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-md font-semibold text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default RecruiterNav;
