import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import {
  Briefcase,
  Users,
  FileText,
  Calendar,
  Gift,
  LogOut,
} from "lucide-react";
import RecruiterNav from "../components/RecruiterNav";

// Dashboard Page
export const DashboardPage = () => {
  const [userRole, setUserRole] = useState("candidate");
  const [userName, setUserName] = useState("");
  const [recruiterStats, setRecruiterStats] = useState({
    active_jobs: 0,
    active_candidates: 0,
    total_applications: 0,
    interviews_scheduled: 0,
    offers_sent: 0,
  });
  const [recruiterStatsLoading, setRecruiterStatsLoading] = useState(true);
  const [recruiterStatsError, setRecruiterStatsError] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserRole(userData.role || "candidate");
        setUserName(userData.username || "User");
        if (userData.role === "candidate") {
          window.location.href = "/#/candidate-dashboard";
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      window.location.href = "/#/signin";
    }
  }, []);

  useEffect(() => {
    if (userRole !== "recruiter") return;
    const token = localStorage.getItem("token");
    if (!token) {
      setRecruiterStats({
        active_jobs: 0,
        active_candidates: 0,
        total_applications: 0,
        interviews_scheduled: 0,
        offers_sent: 0,
      });
      return;
    }
    setRecruiterStatsLoading(true);
    setRecruiterStatsError(null);
    fetch(`${window.API_BASE_URL}/api/recruiter/dashboard/stats/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        setRecruiterStats({
          active_jobs: data.active_jobs || 0,
          active_candidates: data.active_candidates || 0,
          total_applications: data.total_applications || 0,
          interviews_scheduled: data.interviews_scheduled || 0,
          offers_sent: data.offers_sent || 0,
        });
      })
      .catch((err) => {
        console.error("Error fetching recruiter stats:", err);
        setRecruiterStatsError(err.message || "Failed to load stats");
      })
      .finally(() => setRecruiterStatsLoading(false));
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/#/signin";
  };

  const navigationItems = [
    { label: "Job Posts", href: "/#/job-posts", icon: Briefcase },
    { label: "Candidates", href: "/#/recruiter-candidates", icon: Users },
    { label: "Interviews", href: "/#/recruiter-interviews", icon: Calendar },
    { label: "Analytics", href: "/#/recruiter-analytics", icon: FileText },
  ];

  const stats = [
    {
      label: "Active Jobs",
      value: recruiterStats.active_jobs,
      icon: Briefcase,
      color: "from-blue-600 to-indigo-600",
      lightBg: "bg-blue-50/60",
      darkBg: "bg-blue-600/10",
    },
    {
      label: "Active Candidates",
      value: recruiterStats.active_candidates,
      icon: Users,
      color: "from-green-600 to-emerald-600",
      lightBg: "bg-green-50/60",
      darkBg: "bg-green-600/10",
    },
    {
      label: "Total Applications",
      value: recruiterStats.total_applications,
      icon: FileText,
      color: "from-purple-600 to-pink-600",
      lightBg: "bg-purple-50/60",
      darkBg: "bg-purple-600/10",
    },
    {
      label: "Interviews Scheduled",
      value: recruiterStats.interviews_scheduled,
      icon: Calendar,
      color: "from-orange-600 to-red-600",
      lightBg: "bg-orange-50/60",
      darkBg: "bg-orange-600/10",
    },
    {
      label: "Offers Sent",
      value: recruiterStats.offers_sent,
      icon: Gift,
      color: "from-pink-600 to-rose-600",
      lightBg: "bg-pink-50/60",
      darkBg: "bg-pink-600/10",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      <RecruiterNav
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
            Recruiter Dashboard
          </h1>
          <p
            className={`text-lg transition-colors duration-300 ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Welcome back, {userName}! 👋
          </p>
        </div>

        {/* Stats Grid */}
        {recruiterStatsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-4 border-transparent ${
                darkMode ? "border-t-indigo-500" : "border-t-blue-600"
              }`}
            ></div>
          </div>
        ) : recruiterStatsError ? (
          <div
            className={`p-6 rounded-2xl border ${
              darkMode
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-red-50/80 border-red-200 text-red-700"
            }`}
          >
            <p className="font-semibold">{recruiterStatsError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`rounded-3xl border backdrop-blur transition-all duration-300 overflow-hidden group hover:scale-105 cursor-pointer ${
                    darkMode
                      ? `${stat.darkBg} border-slate-700/50 hover:border-slate-700/80 shadow-xl shadow-black/10`
                      : `${stat.lightBg} border-blue-100/50 hover:border-blue-200/80 shadow-lg shadow-blue-500/5`
                  }`}
                >
                  <div className="p-6 h-full flex flex-col">
                    <div
                      className={`p-3 rounded-xl w-fit mb-4 transition-all duration-300 group-hover:scale-110 bg-gradient-to-r ${stat.color}`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    <p
                      className={`text-sm font-semibold uppercase tracking-wide mb-2 ${
                        darkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {stat.label}
                    </p>
                    <p
                      className={`text-4xl font-bold ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
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
            <h2
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Quick Actions
            </h2>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/#/job-posts"
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between group hover:scale-105 transform active:scale-95 ${
                  darkMode
                    ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30"
                    : "bg-blue-100 border border-blue-200 text-blue-700 hover:bg-blue-200"
                }`}
              >
                <span>View Job Posts</span>
                <Briefcase
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="/#/recruiter-candidates"
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between group hover:scale-105 transform active:scale-95 ${
                  darkMode
                    ? "bg-green-600/20 border border-green-500/30 text-green-300 hover:bg-green-600/30"
                    : "bg-green-100 border border-green-200 text-green-700 hover:bg-green-200"
                }`}
              >
                <span>View Candidates</span>
                <Users
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="/#/recruiter-interviews"
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between group hover:scale-105 transform active:scale-95 ${
                  darkMode
                    ? "bg-orange-600/20 border border-orange-500/30 text-orange-300 hover:bg-orange-600/30"
                    : "bg-orange-100 border border-orange-200 text-orange-700 hover:bg-orange-200"
                }`}
              >
                <span>Schedule Interviews</span>
                <Calendar
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="/#/recruiter-analytics"
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between group hover:scale-105 transform active:scale-95 ${
                  darkMode
                    ? "bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
                    : "bg-purple-100 border border-purple-200 text-purple-700 hover:bg-purple-200"
                }`}
              >
                <span>View Analytics</span>
                <FileText
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
