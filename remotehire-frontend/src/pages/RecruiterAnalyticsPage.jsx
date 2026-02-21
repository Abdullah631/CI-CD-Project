import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  PieChart as PieChartIcon,
} from "lucide-react";
import RecruiterNav from "../components/RecruiterNav";
import { API_BASE_URL } from "../config";

export const RecruiterAnalyticsPage = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [userName, setUserName] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/recruiter/analytics/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.status}`);
        }

        const data = await response.json();

        // Transform backend data to match the expected format with icons and colors
        const transformedData = {
          pipelineStatus: data.pipelineStatus || [],
          topJobs: data.topJobs || [],
          metrics: (data.metrics || []).map((metric, idx) => {
            const iconMap = {
              "Total Candidates": {
                icon: Users,
                color: "from-blue-600 to-cyan-600",
              },
              "Active Jobs": {
                icon: Briefcase,
                color: "from-purple-600 to-pink-600",
              },
              "Total Applications": {
                icon: TrendingUp,
                color: "from-green-600 to-emerald-600",
              },
              "Avg. Time to Hire": {
                icon: BarChart3,
                color: "from-orange-600 to-red-600",
              },
            };

            const mapping = iconMap[metric.label] || {
              icon: BarChart3,
              color: "from-gray-600 to-slate-600",
            };

            return {
              ...metric,
              icon: mapping.icon,
              color: mapping.color,
            };
          }),
        };

        setAnalyticsData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Default/fallback analytics data
  const defaultAnalyticsData = {
    pipelineStatus: [
      { stage: "Applied", count: 0 },
      { stage: "Screening", count: 0 },
      { stage: "Interview", count: 0 },
      { stage: "Offer", count: 0 },
    ],
    topJobs: [],
    metrics: [
      {
        icon: Users,
        label: "Total Candidates",
        value: 0,
        change: "0",
        color: "from-blue-600 to-cyan-600",
      },
      {
        icon: Briefcase,
        label: "Active Jobs",
        value: 0,
        change: "+0",
        color: "from-purple-600 to-pink-600",
      },
      {
        icon: TrendingUp,
        label: "Total Applications",
        value: 0,
        change: "0%",
        color: "from-green-600 to-emerald-600",
      },
      {
        icon: BarChart3,
        label: "Avg. Time to Hire",
        value: "N/A",
        change: "0 days",
        color: "from-orange-600 to-red-600",
      },
    ],
  };

  const displayData = analyticsData || defaultAnalyticsData;

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
        currentPage="analytics"
      />

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
            Welcome back, {userName}!
          </h2>
          <p
            className={`text-lg ${
              darkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Here's your recruitment analytics for this month
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div
              className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${
                darkMode ? "border-indigo-400" : "border-indigo-600"
              }`}
            ></div>
            <p
              className={`mt-4 ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Loading analytics...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            className={`rounded-3xl border p-6 mb-8 ${
              darkMode
                ? "bg-red-900/20 border-red-500/50 text-red-200"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <p className="font-semibold">Error loading analytics:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Analytics Content */}
        {!loading && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {displayData.metrics.map((metric, idx) => {
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
                              : metric.change.startsWith("-")
                              ? darkMode
                                ? "text-blue-400"
                                : "text-blue-600"
                              : darkMode
                              ? "text-slate-400"
                              : "text-slate-600"
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
                      className={
                        darkMode ? "text-indigo-400" : "text-indigo-600"
                      }
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
                  {displayData.pipelineStatus.map((item, idx) => {
                    const maxCount = Math.max(
                      ...displayData.pipelineStatus.map((p) => p.count),
                      1
                    );
                    return (
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
                            darkMode ? "bg-slate-700/50" : "bg-blue-100/50"
                          }`}
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{
                              width: `${(item.count / maxCount) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
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
                  {displayData.topJobs.length > 0 ? (
                    displayData.topJobs.map((job, idx) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p
                        className={`${
                          darkMode ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        No job data available yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
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
