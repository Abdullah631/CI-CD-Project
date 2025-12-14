import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Users,
  Mail,
  Briefcase,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import RecruiterNav from "../components/RecruiterNav";

export const RecruiterCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    candidate_id: null,
    job_id: null,
    scheduled_at: "",
  });
  const [scheduling, setScheduling] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState("");

  const token = localStorage.getItem("token");

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

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterAndSortCandidates();
  }, [candidates, searchTerm, sortBy]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${window.API_BASE_URL}/api/recruiter/applicants/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCandidates = () => {
    let filtered = candidates;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.candidate_name &&
            c.candidate_name.toLowerCase().includes(search)) ||
          (c.candidate_email &&
            c.candidate_email.toLowerCase().includes(search)) ||
          (c.candidate_phone && c.candidate_phone.includes(searchTerm)) ||
          (c.job_title && c.job_title.toLowerCase().includes(search))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.candidate_name || "").localeCompare(b.candidate_name || "");
        case "latest":
          return new Date(b.applied_at) - new Date(a.applied_at);
        case "email":
          return (a.candidate_email || "").localeCompare(
            b.candidate_email || ""
          );
        default:
          return 0;
      }
    });

    setFilteredCandidates(filtered);
  };

  const openScheduleModal = (candidate) => {
    setScheduleMessage("");
    setScheduleForm({
      candidate_id: candidate.candidate_id,
      job_id: candidate.job_id,
      scheduled_at: "",
    });
    setScheduleModalOpen(true);
  };

  const submitSchedule = async () => {
    if (!scheduleForm.scheduled_at) {
      setScheduleMessage("Please select date and time.");
      return;
    }
    try {
      setScheduling(true);
      setScheduleMessage("");
      const iso = new Date(scheduleForm.scheduled_at).toISOString();
      await axios.post(
        `${window.API_BASE_URL}/api/interviews/schedule/`,
        { ...scheduleForm, scheduled_at: iso },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScheduleMessage("Interview scheduled successfully.");
      setScheduleModalOpen(false);
    } catch (error) {
      const msg =
        error?.response?.data?.detail || "Failed to schedule interview.";
      setScheduleMessage(msg);
    } finally {
      setScheduling(false);
    }
  };

  const stats = [
    {
      icon: Users,
      label: "Total Applicants",
      value: candidates.length,
      color: "from-blue-600 to-cyan-600",
    },
    {
      icon: Briefcase,
      label: "Jobs Applied To",
      value: [...new Set(candidates.map((c) => c.job_id))].length,
      color: "from-green-600 to-emerald-600",
    },
    {
      icon: Users,
      label: "Unique Candidates",
      value: [...new Set(candidates.map((c) => c.candidate_id))].length,
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
      <RecruiterNav
        darkMode={darkMode}
        onToggleDarkMode={() => {
          setDarkMode(!darkMode);
          localStorage.setItem("darkMode", !darkMode);
        }}
        userName={userName}
        currentPage="candidates"
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border font-semibold transition-all duration-300 focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "bg-slate-700/30 border-slate-600/50 text-white placeholder-slate-400 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    : "bg-blue-50/50 border-blue-100/50 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500/30"
                }`}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <ChevronDown
                size={20}
                className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-xl border font-semibold appearance-none transition-all duration-300 focus:outline-none focus:ring-2 cursor-pointer ${
                  darkMode
                    ? "bg-slate-700/30 border-slate-600/50 text-white focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    : "bg-blue-50/50 border-blue-100/50 text-slate-900 focus:ring-blue-500/30 focus:border-blue-500/30"
                }`}
              >
                <option value="name">Sort by Name</option>
                <option value="latest">Sort by Latest</option>
                <option value="email">Sort by Email</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-4 border-transparent ${
                darkMode ? "border-t-indigo-500" : "border-t-blue-600"
              }`}
            ></div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div
            className={`rounded-3xl border backdrop-blur p-12 text-center transition-all duration-300 ${
              darkMode
                ? "bg-slate-800/40 border-slate-700/50"
                : "bg-white/60 border-blue-100/50"
            }`}
          >
            <Users
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
              {searchTerm
                ? "No candidates match your search"
                : "No candidates yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate, idx) => (
              <div
                key={candidate.application_id}
                className={`rounded-2xl border backdrop-blur transition-all duration-300 transform hover:scale-102 hover:shadow-lg cursor-pointer group ${
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
                    {/* Candidate Info */}
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-3 ${
                          darkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {candidate.candidate_name}
                      </h3>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        <div
                          className={`flex items-center gap-2 text-sm ${
                            darkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          <Mail size={16} />
                          {candidate.candidate_email}
                        </div>
                        {candidate.candidate_phone && (
                          <div
                            className={`flex items-center gap-2 text-sm ${
                              darkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            <Briefcase size={16} />
                            {candidate.candidate_phone}
                          </div>
                        )}
                        <div
                          className={`flex items-center gap-2 text-sm font-semibold ${
                            darkMode ? "text-indigo-400" : "text-blue-600"
                          }`}
                        >
                          <Briefcase size={16} />
                          {candidate.job_title}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            darkMode
                              ? "bg-blue-600/30 text-blue-300 border border-blue-500/50"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {candidate.status}
                        </span>
                        {candidate.similarity_score > 0 && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              candidate.similarity_score >= 70
                                ? darkMode
                                  ? "bg-green-600/30 text-green-300 border border-green-500/50"
                                  : "bg-green-100 text-green-800 border border-green-200"
                                : candidate.similarity_score >= 40
                                ? darkMode
                                  ? "bg-yellow-600/30 text-yellow-300 border border-yellow-500/50"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                : darkMode
                                ? "bg-red-600/30 text-red-300 border border-red-500/50"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            Match: {candidate.similarity_score}%
                          </span>
                        )}
                        {candidate.has_cv && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              darkMode
                                ? "bg-green-600/30 text-green-300 border border-green-500/50"
                                : "bg-green-100 text-green-800 border border-green-200"
                            }`}
                          >
                            Has CV
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-3">
                      <a
                        href={`#/candidate/${candidate.candidate_id}`}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                          darkMode
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 border border-blue-300/50"
                        }`}
                      >
                        <span>View Details</span>
                        <ExternalLink size={18} />
                      </a>
                      <button
                        onClick={() => openScheduleModal(candidate)}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                          darkMode
                            ? "bg-slate-700/70 text-indigo-300 border border-slate-600 hover:bg-slate-700"
                            : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        }`}
                      >
                        Schedule Interview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setScheduleModalOpen(false)}
          ></div>
          <div
            className={`relative w-full max-w-md rounded-2xl border p-6 ${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-blue-100"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Schedule Interview
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduled_at}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      scheduled_at: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-blue-200 text-slate-900"
                  }`}
                />
              </div>
              {scheduleMessage && (
                <div
                  className={`${
                    darkMode ? "text-red-300" : "text-red-600"
                  } text-sm`}
                >
                  {scheduleMessage}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setScheduleModalOpen(false)}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode
                      ? "bg-slate-700 text-slate-300"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  disabled={scheduling}
                  onClick={submitSchedule}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    darkMode
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {scheduling ? "Scheduling..." : "Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default RecruiterCandidatesPage;
