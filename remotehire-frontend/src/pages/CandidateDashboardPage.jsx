import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Briefcase,
  CheckCircle2,
  LogOut,
  User,
  TrendingUp,
  Calendar,
  Trash2,
} from "lucide-react";
import CandidateNav from "../components/CandidateNav";

// Candidate Dashboard Page Component
export const CandidateDashboardPage = () => {
  const [userName, setUserName] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Load user data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserName(userData.username || "User");
        // Verify user is a candidate
        if (userData.role !== "candidate") {
          window.location.href = "/#/dashboard";
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      window.location.href = "/#/signin";
    }
  }, []);

  // Load dashboard stats
  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      setStatsLoading(false);
      setError("");
      try {
        const res = await axios.get(
          `${window.API_BASE_URL}/api/candidate/dashboard/stats/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApplicationsCount(res.data.applications_count || 0);
        setActiveJobsCount(res.data.active_jobs_count || 0);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load dashboard stats");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  // Load applications
  useEffect(() => {
    if (!token) return;
    const fetchApplications = async () => {
      setApplicationsLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `${window.API_BASE_URL}/api/candidate/applications/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApplications(res.data || []);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications");
      } finally {
        setApplicationsLoading(false);
      }
    };
    fetchApplications();
  }, [token]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/#/signin";
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (
      !window.confirm("Are you sure you want to withdraw this application?")
    ) {
      return;
    }
    try {
      await axios.delete(
        `${window.API_BASE_URL}/api/candidate/applications/${applicationId}/withdraw/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Application withdrawn successfully");
      // Reload applications
      const res = await axios.get(
        `${window.API_BASE_URL}/api/candidate/applications/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplications(res.data || []);
      setApplicationsCount((res.data || []).length);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error withdrawing application:", err);
      setError("Failed to withdraw application");
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
      <CandidateNav
        darkMode={darkMode}
        onToggleDarkMode={() => {
          setDarkMode(!darkMode);
          localStorage.setItem("darkMode", !darkMode);
        }}
        userName={userName}
        currentPage="dashboard"
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-12">
          <h1
            className={`text-4xl sm:text-5xl font-bold mb-2 transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Dashboard
          </h1>
          <p
            className={`text-lg transition-colors duration-300 ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Welcome back, {userName}!
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 animate-slideDown ${
              darkMode
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-red-50/80 border-red-200 text-red-700"
            }`}
          >
            <span className="text-xl mt-0.5">⚠️</span>
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 animate-slideDown ${
              darkMode
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : "bg-green-50/80 border-green-200 text-green-700"
            }`}
          >
            <span className="text-xl mt-0.5">✅</span>
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Applications Count */}
          <div
            className={`rounded-3xl border backdrop-blur transition-all duration-300 overflow-hidden group hover:scale-105 cursor-pointer ${
              darkMode
                ? "bg-blue-600/10 border-blue-500/30 hover:border-blue-500/50 shadow-xl shadow-blue-500/10"
                : "bg-blue-50/60 border-blue-100/50 hover:border-blue-200/80 shadow-lg shadow-blue-500/5"
            }`}
          >
            <div className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide mb-2 ${
                      darkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    Applications Sent
                  </p>
                  {statsLoading ? (
                    <div
                      className={`h-12 w-20 rounded-lg animate-pulse ${
                        darkMode ? "bg-slate-700/30" : "bg-slate-200/30"
                      }`}
                    ></div>
                  ) : (
                    <p
                      className={`text-5xl font-bold transition-all duration-300 group-hover:text-6xl ${
                        darkMode ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      {applicationsCount}
                    </p>
                  )}
                </div>
                <div
                  className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                    darkMode
                      ? "bg-blue-600/30 text-blue-300"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <CheckCircle2 size={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Active Jobs Count */}
          <div
            className={`rounded-3xl border backdrop-blur transition-all duration-300 overflow-hidden group hover:scale-105 cursor-pointer ${
              darkMode
                ? "bg-green-600/10 border-green-500/30 hover:border-green-500/50 shadow-xl shadow-green-500/10"
                : "bg-green-50/60 border-green-100/50 hover:border-green-200/80 shadow-lg shadow-green-500/5"
            }`}
          >
            <div className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide mb-2 ${
                      darkMode ? "text-green-300" : "text-green-600"
                    }`}
                  >
                    Active Job Openings
                  </p>
                  {statsLoading ? (
                    <div
                      className={`h-12 w-20 rounded-lg animate-pulse ${
                        darkMode ? "bg-slate-700/30" : "bg-slate-200/30"
                      }`}
                    ></div>
                  ) : (
                    <p
                      className={`text-5xl font-bold transition-all duration-300 group-hover:text-6xl ${
                        darkMode ? "text-green-300" : "text-green-700"
                      }`}
                    >
                      {activeJobsCount}
                    </p>
                  )}
                </div>
                <div
                  className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                    darkMode
                      ? "bg-green-600/30 text-green-300"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  <Briefcase size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div
          className={`rounded-3xl border backdrop-blur transition-all duration-300 overflow-hidden ${
            darkMode
              ? "bg-slate-800/40 border-slate-700/50 shadow-xl shadow-black/20"
              : "bg-white/60 border-blue-100/50 shadow-lg shadow-blue-500/5"
          }`}
        >
          {/* Section Header */}
          <div
            className={`px-8 py-6 border-b transition-all duration-300 ${
              darkMode
                ? "bg-indigo-600/10 border-slate-700/50"
                : "bg-blue-600/5 border-blue-100/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  darkMode
                    ? "bg-indigo-600/30 text-indigo-400"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <TrendingUp size={24} />
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  My Applications
                </h2>
                <p
                  className={`text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Track your job applications and their status
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className={`animate-spin rounded-full h-12 w-12 border-4 border-transparent ${
                    darkMode ? "border-t-indigo-500" : "border-t-blue-600"
                  }`}
                ></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <p
                  className={`text-lg font-semibold mb-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  No applications yet
                </p>
                <p
                  className={`text-sm mb-6 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Start exploring job opportunities to apply
                </p>
                <a
                  href="/#/find-jobs"
                  className={`inline-block px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    darkMode
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 border border-blue-300/50"
                  }`}
                >
                  🚀 Browse Jobs
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app, index) => (
                  <div
                    key={app.id}
                    className={`p-6 rounded-2xl border transition-all duration-300 transform hover:scale-102 hover:shadow-lg animate-fadeInUp ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600/50 hover:border-slate-600/80 hover:shadow-slate-900/50"
                        : "bg-white/50 border-blue-100/50 hover:border-blue-200/80 hover:shadow-blue-500/5"
                    }`}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${
                        index * 50
                      }ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Job Title */}
                        <h3
                          className={`text-xl font-bold mb-2 truncate transition-colors duration-300 ${
                            darkMode
                              ? "text-white hover:text-indigo-300"
                              : "text-slate-900 hover:text-blue-600"
                          }`}
                        >
                          {app.job_title}
                        </h3>

                        {/* Job Description */}
                        <p
                          className={`text-sm mb-3 line-clamp-2 ${
                            darkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {app.job_description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          {/* Status Badge */}
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
                              app.job_status === "active"
                                ? darkMode
                                  ? "bg-green-600/30 text-green-300 border border-green-500/30"
                                  : "bg-green-100 text-green-800 border border-green-200"
                                : darkMode
                                ? "bg-slate-600/30 text-slate-300 border border-slate-500/30"
                                : "bg-slate-200 text-slate-700 border border-slate-300"
                            }`}
                          >
                            {app.job_status === "active" ? "🟢" : "⭕"}{" "}
                            {app.job_status}
                          </span>

                          {/* Recruiter */}
                          <span
                            className={`text-xs font-medium flex items-center gap-1 ${
                              darkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            👤 {app.recruiter}
                          </span>

                          {/* Applied Date */}
                          <span
                            className={`text-xs font-medium flex items-center gap-1 ${
                              darkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            <Calendar size={14} />
                            {new Date(app.applied_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Withdraw Button */}
                      <button
                        onClick={() => handleWithdrawApplication(app.id)}
                        className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                          darkMode
                            ? "hover:bg-red-600/30 text-red-400 hover:text-red-300"
                            : "hover:bg-red-100 text-red-600 hover:text-red-700"
                        }`}
                        title="Withdraw application"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-12 flex justify-center gap-4">
          <a
            href="/#/find-jobs"
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              darkMode
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 border border-blue-300/50"
            }`}
          >
            Browse Jobs
          </a>
          <a
            href="/#/profile"
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              darkMode
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600/50"
                : "bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-300"
            }`}
          >
            My Profile
          </a>
        </div>
      </main>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }

        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default CandidateDashboardPage;
