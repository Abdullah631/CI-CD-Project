import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Menu,
  X,
  PieChart as PieChartIcon,
} from "lucide-react";

export const RecruiterAnalyticsPage = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserName(userData.username || "User");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Sample analytics data
  const analyticsData = {
    pipelineStatus: [
      { stage: "Applied", count: 42 },
      { stage: "Screening", count: 15 },
      { stage: "Interview", count: 8 },
      { stage: "Offer", count: 3 },
    ],
    topJobs: [
      { title: "React Developer", applications: 28 },
      { title: "Full Stack Dev", applications: 22 },
      { title: "UI Designer", applications: 18 },
      { title: "Backend Dev", applications: 15 },
    ],
    metrics: [
      {
        icon: Users,
        label: "Total Candidates",
        value: 156,
        change: "+12%",
        color: "from-blue-600 to-cyan-600",
      },
      {
        icon: Briefcase,
        label: "Active Jobs",
        value: 8,
        change: "+2",
        color: "from-purple-600 to-pink-600",
      },
      {
        icon: TrendingUp,
        label: "Total Applications",
        value: 68,
        change: "+18%",
        color: "from-green-600 to-emerald-600",
      },
      {
        icon: BarChart3,
        label: "Avg. Time to Hire",
        value: "14 days",
        change: "-2 days",
        color: "from-orange-600 to-red-600",
      },
    ],
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-all duration-300 ${
          darkMode
            ? "bg-slate-800/80 border-slate-700/50"
            : "bg-white/80 border-blue-100/50"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "bg-indigo-600/20 text-indigo-400"
                    : "bg-blue-600/10 text-blue-600"
                }`}
              >
                <BarChart3 size={24} />
              </div>
              <h1
                className={`text-2xl font-bold hidden sm:block ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Analytics
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  darkMode
                    ? "text-slate-300 hover:bg-slate-700/50"
                    : "text-slate-700 hover:bg-blue-100/50"
                }`}
              >
                Overview
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-700/50"
                    : "text-slate-600 hover:bg-blue-100/50"
                }`}
              >
                Reports
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav
              className={`mt-4 space-y-2 md:hidden animate-slideDown ${
                darkMode ? "bg-slate-700/30" : "bg-blue-50/30"
              } p-4 rounded-xl`}
            >
              <button
                className={`block w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  darkMode
                    ? "text-slate-300 hover:bg-slate-700/50"
                    : "text-slate-700 hover:bg-blue-100/50"
                }`}
              >
                Overview
              </button>
              <button
                className={`block w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-700/50"
                    : "text-slate-600 hover:bg-blue-100/50"
                }`}
              >
                Reports
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div
          className={`rounded-3xl border backdrop-blur mb-12 p-8 transition-all duration-300 ${
            darkMode
              ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/30"
              : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50"
          }`}
        >
          <h2
            className={`text-3xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Welcome back, {userName}! 👋
          </h2>
          <p
            className={`text-lg ${darkMode ? "text-slate-300" : "text-slate-600"}`}
          >
            Here's your recruitment analytics for this month
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {analyticsData.metrics.map((metric, idx) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={idx}
                className={`rounded-3xl border backdrop-blur transition-all duration-300 transform hover:scale-105 ${
                  darkMode
                    ? "bg-slate-800/40 border-slate-700/50 shadow-lg shadow-black/20"
                    : "bg-white/60 border-blue-100/50 shadow-lg shadow-blue-500/5"
                }`}
                style={{
                  animationDelay: `${idx * 50}ms`,
                  animation: "fadeInUp 0.6s ease-out",
                }}
              >
                <div className="p-6">
                  <div
                    className={`p-3 rounded-xl w-fit mb-4 bg-gradient-to-r ${metric.color}`}
                  >
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide mb-2 ${
                      darkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {metric.label}
                  </p>
                  <div className="flex items-end justify-between gap-2">
                    <p
                      className={`text-3xl font-bold ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {metric.value}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        metric.change.startsWith("+")
                          ? darkMode
                            ? "text-green-400"
                            : "text-green-600"
                          : darkMode
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    >
                      {metric.change}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Status */}
          <div
            className={`rounded-3xl border backdrop-blur transition-all duration-300 ${
              darkMode
                ? "bg-slate-800/40 border-slate-700/50"
                : "bg-white/60 border-blue-100/50"
            }`}
            style={{
              animation: "fadeInUp 0.6s ease-out 150ms",
              animationFillMode: "both",
            }}
          >
            <div className="p-8 border-b transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <PieChartIcon
                  size={24}
                  className={darkMode ? "text-indigo-400" : "text-indigo-600"}
                />
                <h3
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Pipeline Status
                </h3>
              </div>
              <p
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Candidate distribution across stages
              </p>
            </div>

            <div className="p-8 space-y-4">
              {analyticsData.pipelineStatus.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`font-semibold ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {item.stage}
                    </span>
                    <span
                      className={`font-bold ${
                        darkMode ? "text-indigo-400" : "text-indigo-600"
                      }`}
                    >
                      {item.count}
                    </span>
                  </div>
                  <div
                    className={`w-full h-2 rounded-full overflow-hidden transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-700/50"
                        : "bg-blue-100/50"
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{
                        width: `${(item.count / 42) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Jobs */}
          <div
            className={`rounded-3xl border backdrop-blur transition-all duration-300 ${
              darkMode
                ? "bg-slate-800/40 border-slate-700/50"
                : "bg-white/60 border-blue-100/50"
            }`}
            style={{
              animation: "fadeInUp 0.6s ease-out 200ms",
              animationFillMode: "both",
            }}
          >
            <div className="p-8 border-b transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp
                  size={24}
                  className={darkMode ? "text-green-400" : "text-green-600"}
                />
                <h3
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Top Jobs
                </h3>
              </div>
              <p
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Most applications received
              </p>
            </div>

            <div className="p-8 space-y-4">
              {analyticsData.topJobs.map((job, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-700/30 hover:bg-slate-700/50"
                      : "bg-blue-50/50 hover:bg-blue-100/50"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        idx === 0
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                          : idx === 1
                          ? "bg-gradient-to-r from-purple-500 to-pink-500"
                          : idx === 2
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : "bg-gradient-to-r from-orange-500 to-red-500"
                      }`}
                    ></div>
                    <span
                      className={`font-semibold ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {job.title}
                    </span>
                  </div>
                  <span
                    className={`font-bold px-3 py-1 rounded-lg ${
                      darkMode
                        ? "bg-slate-600/50 text-slate-200"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {job.applications}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* CSS for animations */}
      <style>{`
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RecruiterAnalyticsPage;
