import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  Search,
  ChevronDown,
} from "lucide-react";

export const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [notifiedInterviews, setNotifiedInterviews] = useState(new Set());
  const notifiedRef = useRef(new Set()); // Track immediately to prevent duplicate notifications

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Check for upcoming interviews and send notifications
  useEffect(() => {
    if (!interviews.length) return;

    const now = Date.now();
    interviews.forEach((interview) => {
      const interviewTime = new Date(interview.scheduled_at).getTime();
      const timeDiff = interviewTime - now;
      const minutes = Math.floor(timeDiff / (1000 * 60));

      // Notify 5 minutes before and when interview starts
      const shouldNotify =
        (minutes === 5 || minutes === 0) &&
        timeDiff > 0 &&
        !notifiedRef.current.has(`${interview.id}-${minutes}`);

      if (
        shouldNotify &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        // Mark as notified immediately to prevent duplicates
        notifiedRef.current.add(`${interview.id}-${minutes}`);
        const title =
          minutes === 5
            ? "Interview Starting Soon!"
            : "Interview Starting Now!";
        const body =
          minutes === 5
            ? `Interview with ${interview.candidate_name} starts in 5 minutes!`
            : `Interview with ${interview.candidate_name} is starting now!`;

        new Notification(title, {
          body,
          icon: "/favicon.ico",
          tag: `interview-${interview.id}`,
          requireInteraction: true,
        });

        setNotifiedInterviews(
          (prev) => new Set([...prev, `${interview.id}-${minutes}`])
        );
      }
    });
  }, [interviews, currentTime]); // Removed notifiedInterviews from dependencies

  useEffect(() => {
    const token = localStorage.getItem("token");
    const load = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/interviews/recruiter/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setInterviews(res.data || []);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load interviews.");
      }
    };
    load();
  }, []);

  const getCountdown = (scheduledAt) => {
    const diff = new Date(scheduledAt).getTime() - currentTime;
    if (diff <= 0) return "Interview time has passed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  // Get upcoming interviews (within next 15 minutes)
  const getUpcomingInterviews = () => {
    const now = Date.now();
    return interviews.filter((interview) => {
      const interviewTime = new Date(interview.scheduled_at).getTime();
      const timeDiff = interviewTime - now;
      const minutes = Math.floor(timeDiff / (1000 * 60));
      return minutes >= 0 && minutes <= 15;
    });
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      (interview.candidate_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (interview.job_title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || interview.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      icon: Calendar,
      label: "Scheduled",
      value: interviews.filter((i) => i.status === "Scheduled").length,
      color: "from-blue-600 to-cyan-600",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: interviews.filter((i) => i.status === "Completed").length,
      color: "from-green-600 to-emerald-600",
    },
    {
      icon: AlertCircle,
      label: "Total Interviews",
      value: interviews.length,
      color: "from-purple-600 to-pink-600",
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
                <Calendar size={24} />
              </div>
              <h1
                className={`text-2xl font-bold hidden sm:block ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Interviews
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
                All Interviews
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-700/50"
                    : "text-slate-600 hover:bg-blue-100/50"
                }`}
              >
                Upcoming
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
                All Interviews
              </button>
              <button
                className={`block w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-700/50"
                    : "text-slate-600 hover:bg-blue-100/50"
                }`}
              >
                Upcoming
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upcoming Interview Alert Banner */}
        {getUpcomingInterviews().length > 0 && (
          <div
            className={`mb-6 rounded-2xl border backdrop-blur p-6 animate-pulse ${
              darkMode
                ? "bg-orange-600/20 border-orange-500/50"
                : "bg-orange-100 border-orange-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl ${
                  darkMode ? "bg-orange-600/30" : "bg-orange-200"
                }`}
              >
                <AlertCircle
                  size={24}
                  className={darkMode ? "text-orange-300" : "text-orange-700"}
                />
              </div>
              <div className="flex-1">
                <h3
                  className={`text-lg font-bold mb-2 ${
                    darkMode ? "text-orange-200" : "text-orange-900"
                  }`}
                >
                  🔔 Upcoming Interview Alert!
                </h3>
                {getUpcomingInterviews().map((iv) => {
                  const minutes = Math.floor(
                    (new Date(iv.scheduled_at).getTime() - Date.now()) /
                      (1000 * 60)
                  );
                  return (
                    <p
                      key={iv.id}
                      className={`text-sm font-semibold mb-1 ${
                        darkMode ? "text-orange-300" : "text-orange-800"
                      }`}
                    >
                      Interview with {iv.candidate_name} starts in {minutes}{" "}
                      minute{minutes !== 1 ? "s" : ""}! (
                      {new Date(iv.scheduled_at).toLocaleTimeString()})
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;
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
                    className={`p-3 rounded-xl w-fit mb-4 bg-gradient-to-r ${stat.color}`}
                  >
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide mb-1 ${
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

        {/* Search and Filter Section */}
        <div
          className={`rounded-3xl border backdrop-blur mb-8 p-6 transition-all duration-300 ${
            darkMode
              ? "bg-slate-800/40 border-slate-700/50"
              : "bg-white/60 border-blue-100/50"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={20}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border font-semibold transition-all duration-300 focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "bg-slate-700/30 border-slate-600/50 text-white placeholder-slate-400 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    : "bg-blue-50/50 border-blue-100/50 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500/30"
                }`}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <ChevronDown
                size={20}
                className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-xl border font-semibold appearance-none transition-all duration-300 focus:outline-none focus:ring-2 cursor-pointer ${
                  darkMode
                    ? "bg-slate-700/30 border-slate-600/50 text-white focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    : "bg-blue-50/50 border-blue-100/50 text-slate-900 focus:ring-blue-500/30 focus:border-blue-500/30"
                }`}
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interviews List */}
        <div className="space-y-4">
          {filteredInterviews.length === 0 ? (
            <div
              className={`rounded-3xl border backdrop-blur p-12 text-center transition-all duration-300 ${
                darkMode
                  ? "bg-slate-800/40 border-slate-700/50"
                  : "bg-white/60 border-blue-100/50"
              }`}
            >
              <Calendar
                size={48}
                className={`mx-auto mb-4 ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              />
              <p
                className={`text-lg font-semibold ${
                  darkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                No interviews found
              </p>
            </div>
          ) : (
            filteredInterviews.map((interview, idx) => (
              <div
                key={interview.id}
                className={`rounded-2xl border backdrop-blur transition-all duration-300 transform hover:scale-102 hover:shadow-lg ${
                  darkMode
                    ? "bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50 shadow-md hover:shadow-lg hover:shadow-indigo-500/10"
                    : "bg-white/60 border-blue-100/50 hover:border-blue-200/50 shadow-md hover:shadow-lg hover:shadow-blue-500/10"
                }`}
                style={{
                  animationDelay: `${idx * 50}ms`,
                  animation: "fadeInUp 0.6s ease-out",
                }}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Interview Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <User
                          size={24}
                          className={
                            darkMode ? "text-blue-400" : "text-blue-600"
                          }
                        />
                        <h3
                          className={`text-xl font-bold ${
                            darkMode ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {interview.candidate_name}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-3">
                        <div
                          className={`flex items-center gap-2 text-sm font-semibold ${
                            darkMode ? "text-indigo-300" : "text-indigo-600"
                          }`}
                        >
                          <Briefcase size={16} />
                          {interview.job_title}
                        </div>
                        <div
                          className={`flex items-center gap-2 text-sm ${
                            darkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          <Calendar size={16} />
                          {new Date(
                            interview.scheduled_at
                          ).toLocaleDateString()}
                        </div>
                        <div
                          className={`flex items-center gap-2 text-sm ${
                            darkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          <Clock size={16} />
                          {new Date(
                            interview.scheduled_at
                          ).toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-xs font-bold ${
                          interview.status === "Scheduled"
                            ? darkMode
                              ? "bg-blue-600/30 text-blue-300 border border-blue-500/50"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                            : darkMode
                            ? "bg-green-600/30 text-green-300 border border-green-500/50"
                            : "bg-green-100 text-green-800 border border-green-200"
                        }`}
                      >
                        {interview.status}
                      </span>

                      {/* Countdown Timer */}
                      <div
                        className={`mt-3 px-3 py-2 rounded-lg w-fit font-semibold text-sm ${
                          darkMode
                            ? "bg-orange-600/20 text-orange-300 border border-orange-500/30"
                            : "bg-orange-100 text-orange-700 border border-orange-200"
                        }`}
                      >
                        ⏱️ {getCountdown(interview.scheduled_at)}
                      </div>
                    </div>

                    {/* Action Button */}
                    {(() => {
                      const now = Date.now();
                      const interviewTime = new Date(
                        interview.scheduled_at
                      ).getTime();
                      const timeDiff = interviewTime - now;
                      const minutesUntil = Math.floor(timeDiff / (1000 * 60));
                      const canJoin = minutesUntil <= 5 && minutesUntil >= -30; // Can join 5 min before to 30 min after

                      if (canJoin) {
                        return (
                          <button
                            onClick={() =>
                              (window.location.hash = `/interview-room?id=${interview.id}`)
                            }
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap animate-pulse ${
                              darkMode
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50"
                                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30"
                            }`}
                          >
                            🎥 Join Interview
                          </button>
                        );
                      }
                      return (
                        <button
                          disabled
                          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap opacity-50 cursor-not-allowed ${
                            darkMode
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          }`}
                        >
                          Interview Scheduled
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))
          )}
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

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default RecruiterInterviewsPage;
