import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../config";

const CandidateInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [notifiedInterviews, setNotifiedInterviews] = useState(new Set());
  const notifiedRef = useRef(new Set()); // Track immediately to prevent duplicate notifications
  const token = localStorage.getItem("token");

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

  // Check for upcoming interviews and send notifications
  useEffect(() => {
    if (!interviews.length) return;

    const now = Date.now();
    interviews.forEach((interview) => {
      const interviewTime = new Date(interview.scheduled_at).getTime();
      const timeDiff = interviewTime - now;
      const minutes = Math.floor(timeDiff / (1000 * 60));

      // Notify 5 minutes before and when interview starts
      const status = (interview.status || "").toLowerCase();
      const shouldNotify =
        (minutes === 5 || minutes === 0) &&
        timeDiff > 0 &&
        !notifiedRef.current.has(`${interview.id}-${minutes}`) &&
        (status === "scheduled" || status === "accepted");

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
            ? `Your interview with ${interview.recruiter_name} starts in 5 minutes!`
            : `Your interview with ${interview.recruiter_name} is starting now!`;

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
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/interviews/candidate/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setInterviews(res.data || []);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load interviews.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const respond = async (id, action) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/interviews/${id}/response/`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update with the returned interview data from backend
      setInterviews((prev) =>
        prev.map((iv) => (iv.id === id ? res.data.interview : iv))
      );
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          "Failed to respond."
      );
    }
  };

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
      const isScheduledOrAccepted =
        (interview.status || "").toLowerCase() === "scheduled" ||
        (interview.status || "").toLowerCase() === "accepted";
      return minutes >= 0 && minutes <= 15 && isScheduledOrAccepted;
    });
  };

  const stats = [
    {
      icon: Calendar,
      label: "Scheduled",
      value: interviews.filter(
        (i) => (i.status || "").toLowerCase() === "scheduled"
      ).length,
      color: "from-blue-600 to-cyan-600",
    },
    {
      icon: CheckCircle,
      label: "Accepted",
      value: interviews.filter(
        (i) => (i.status || "").toLowerCase() === "accepted"
      ).length,
      color: "from-green-600 to-emerald-600",
    },
    {
      icon: AlertCircle,
      label: "All",
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
      <header
        className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-all duration-300 ${
          darkMode
            ? "bg-slate-800/80 border-slate-700/50"
            : "bg-white/80 border-blue-100/50"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
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
                My Interviews
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = !darkMode;
                  setDarkMode(next);
                  localStorage.setItem("darkMode", next);
                }}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
              <a
                href="/#/candidate-dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  darkMode
                    ? "text-slate-300 hover:bg-slate-700/50"
                    : "text-slate-700 hover:bg-blue-100/50"
                }`}
              >
                Dashboard
              </a>
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
        </div>
      </header>

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
                      Interview with {iv.recruiter_name} starts in {minutes}{" "}
                      minute{minutes !== 1 ? "s" : ""}! (
                      {new Date(iv.scheduled_at).toLocaleTimeString()})
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
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
                    <Icon size={24} className="text-white" />
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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-4 border-transparent ${
                darkMode ? "border-t-indigo-500" : "border-t-blue-600"
              }`}
            ></div>
          </div>
        ) : error ? (
          <div
            className={`rounded-3xl border backdrop-blur p-6 ${
              darkMode
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-red-50/80 border-red-200 text-red-700"
            }`}
          >
            {error}
          </div>
        ) : interviews.length === 0 ? (
          <div
            className={`rounded-3xl border backdrop-blur p-12 text-center ${
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
              No interviews yet
            </p>
            <p className={`${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Once a recruiter schedules, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((iv, idx) => (
              <div
                key={iv.id}
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
                          {iv.recruiter_name}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-4 mb-3">
                        <div
                          className={`flex items-center gap-2 text-sm font-semibold ${
                            darkMode ? "text-indigo-300" : "text-indigo-600"
                          }`}
                        >
                          {" "}
                          <Calendar size={16} />{" "}
                          {new Date(iv.scheduled_at).toLocaleDateString()}{" "}
                        </div>
                        <div
                          className={`flex items-center gap-2 text-sm ${
                            darkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {" "}
                          <Clock size={16} />{" "}
                          {new Date(iv.scheduled_at).toLocaleTimeString()}{" "}
                        </div>
                      </div>
                      <div
                        className={`text-sm ${
                          darkMode ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Job: {iv.job_title}
                      </div>
                      <div
                        className={`mt-2 px-3 py-2 rounded-lg w-fit font-semibold text-sm ${
                          darkMode
                            ? "bg-orange-600/20 text-orange-300 border border-orange-500/30"
                            : "bg-orange-100 text-orange-700 border border-orange-200"
                        }`}
                      >
                        ⏱️ {getCountdown(iv.scheduled_at)}
                      </div>
                      <div className="mt-3">
                        {(() => {
                          const s = String(iv.status || "").toLowerCase();
                          const label = s.charAt(0).toUpperCase() + s.slice(1);
                          const base =
                            "inline-block px-4 py-2 rounded-full text-xs font-bold ";
                          const cls =
                            s === "scheduled" || s === "pending"
                              ? darkMode
                                ? "bg-blue-600/30 text-blue-300 border border-blue-500/50"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                              : s === "accepted"
                              ? darkMode
                                ? "bg-green-600/30 text-green-300 border border-green-500/50"
                                : "bg-green-100 text-green-800 border border-green-200"
                              : darkMode
                              ? "bg-red-600/30 text-red-300 border border-red-500/50"
                              : "bg-red-100 text-red-800 border border-red-200";
                          return <span className={base + cls}>{label}</span>;
                        })()}
                      </div>
                    </div>
                    {(() => {
                      const s = (iv.status || "").toLowerCase();
                      const now = Date.now();
                      const interviewTime = new Date(iv.scheduled_at).getTime();
                      const timeDiff = interviewTime - now;
                      const minutesUntil = Math.floor(timeDiff / (1000 * 60));
                      const canJoin = minutesUntil <= 5 && minutesUntil >= -30; // Can join 5 min before to 30 min after

                      if (canJoin && (s === "scheduled" || s === "accepted")) {
                        return (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                (window.location.hash = `/interview-room?id=${iv.id}`)
                              }
                              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap animate-pulse ${
                                darkMode
                                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50"
                                  : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30"
                              }`}
                            >
                              🎥 Join Interview
                            </button>
                          </div>
                        );
                      } else if (s === "scheduled" || s === "pending") {
                        return (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => respond(iv.id, "accept")}
                              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                                darkMode
                                  ? "bg-green-600 text-white hover:bg-green-500"
                                  : "bg-green-600 text-white hover:bg-green-500"
                              }`}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => respond(iv.id, "decline")}
                              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                                darkMode
                                  ? "bg-red-600 text-white hover:bg-red-500"
                                  : "bg-red-600 text-white hover:bg-red-500"
                              }`}
                            >
                              Decline
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .hover\\:scale-102:hover { transform: scale(1.02); }`}</style>
    </div>
  );
};

export default CandidateInterviewsPage;
