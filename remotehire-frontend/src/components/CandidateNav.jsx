import React, { useState } from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

/**
 * Navbar for candidate pages.
 * Props:
 * - userName: string with candidate's name
 * - currentPage: string indicating which page is active (e.g., 'dashboard', 'details', 'interviews', 'profile', 'findjobs')
 */
export const CandidateNav = ({ userName, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      path: "/#/candidate-dashboard",
      id: "dashboard",
      icon: DashboardIcon,
    },
    {
      label: "Find Jobs",
      path: "/#/find-jobs",
      id: "findjobs",
      icon: SearchIcon,
    },
    {
      label: "Interviews",
      path: "/#/candidate-interviews",
      id: "interviews",
      icon: CalendarTodayIcon,
    },
    { label: "Profile", path: "/#/profile", id: "profile", icon: PersonIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/#/";
  };

  return (
    <nav
      className="sticky top-0 z-40 backdrop-blur-lg border-b"
      style={{
        background: "rgba(244, 239, 222, 0.95)",
        borderColor: "var(--border-strong)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <div
              className="p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #b2724d, #a5b9a3)",
              }}
            >
              <BoltIcon style={{ fontSize: 24, color: "#f4efde" }} />
            </div>
            <span
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              <a href="/#/">RemoteHire.io</a>
            </span>
          </div>

          {/* Desktop Navigation - now always visible */}
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
                  {Icon && <Icon style={{ fontSize: 16 }} />}
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-3">
            {/* User Info & Settings */}
            <div className="flex items-center gap-3">
              {userName && (
                <span
                  className="pill"
                  style={{
                    background: "rgba(165, 185, 163, 0.25)",
                    borderColor: "var(--border-strong)",
                    fontSize: "0.875rem",
                    padding: "0.25rem 0.75rem",
                  }}
                >
                  {userName}
                </span>
              )}
              <button
                title="Settings"
                className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-secondary)",
                }}
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                style={{
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  color: "#dc2626",
                }}
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg"
              style={{ color: "var(--text-primary)" }}
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <a
                  key={item.id}
                  href={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, var(--cinnamon), var(--sage))"
                      : "var(--surface-0)",
                    color: isActive ? "var(--cream)" : "var(--text-primary)",
                    border: "1px solid var(--border-strong)",
                  }}
                >
                  {Icon && <Icon style={{ fontSize: 20 }} />}
                  {item.label}
                </a>
              );
            })}
            <div
              style={{
                borderTop: "1px solid var(--border-strong)",
                paddingTop: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                style={{
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  color: "#dc2626",
                }}
              >
                <LogoutIcon style={{ fontSize: 18 }} />
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
