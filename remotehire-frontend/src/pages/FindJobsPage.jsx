import React, { useState, useEffect } from "react";
import axios from "axios";
import JobDetailsModal from "../components/JobDetailsModal";
import { Search, Briefcase } from "lucide-react";
import CandidateNav from "../components/CandidateNav";

export const FindJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
        if (userData.role !== "candidate") {
          window.location.href = "/#/dashboard";
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${window.API_BASE_URL}/api/jobs/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const allJobs = res.data || [];
        const activeJobs = allJobs.filter(
          (job) => (job.status || "").toLowerCase() === "active"
        );
        setJobs(activeJobs);

        if (token) {
          try {
            const appsRes = await axios.get(
              `${window.API_BASE_URL}/api/candidate/applications/`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const appliedSet = new Set(
              (appsRes.data || []).map((app) => app.job_id)
            );
            setAppliedJobs(appliedSet);
          } catch (err) {
            console.error("Error loading applications:", err);
          }
        }
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 403) {
          setError(
            "You do not have permission to view jobs. Please sign in as a candidate."
          );
        } else if (err.response && err.response.status === 404) {
          setError("Jobs API not found (404). Check backend routes.");
        } else {
          setError("Failed to load jobs");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    const updateListener = () => fetchJobs();
    window.addEventListener("jobsUpdated", updateListener);
    const storageHandler = (e) => {
      if (e.key === "jobs_updated") fetchJobs();
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("jobsUpdated", updateListener);
      window.removeEventListener("storage", storageHandler);
    };
  }, [token]);

  const handleApply = async (jobId) => {
    setError("");
    setSuccess("");

    if (!token) {
      setError("You must be logged in to apply for jobs");
      return;
    }

    try {
      const response = await axios.post(
        `${window.API_BASE_URL}/api/jobs/${jobId}/apply/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppliedJobs(new Set([...appliedJobs, jobId]));
      setSuccess("Application submitted successfully!");
      window.dispatchEvent(new Event("jobsUpdated"));

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        setError(
          "You do not have permission to apply. Please sign in as a candidate."
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to apply for job");
      }
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.posted_by &&
        job.posted_by.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        currentPage="findjobs"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-12">
          <div
            className={`relative transition-all duration-300 ${
              darkMode
                ? "bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50"
                : "bg-white/50 border border-blue-100/50 hover:border-blue-200"
            } rounded-2xl backdrop-blur-lg p-6 focus-within:ring-2 ${
              darkMode
                ? "focus-within:ring-indigo-500/50"
                : "focus-within:ring-blue-400/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Search
                className={`flex-shrink-0 ${
                  darkMode ? "text-indigo-400" : "text-blue-600"
                }`}
                size={24}
              />
              <input
                type="text"
                placeholder="Search jobs by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full bg-transparent outline-none placeholder-shown: text-lg transition-all duration-300 ${
                  darkMode
                    ? "text-white placeholder-slate-500"
                    : "text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            className={`mb-8 p-4 rounded-xl backdrop-blur-lg border transition-all duration-300 animate-slide-down ${
              darkMode
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            ❌ {error}
          </div>
        )}
        {success && (
          <div
            className={`mb-8 p-4 rounded-xl backdrop-blur-lg border transition-all duration-300 animate-slide-down ${
              darkMode
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            ✅ {success}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className={`w-16 h-16 rounded-full animate-spin ${
                darkMode
                  ? "border-4 border-slate-700 border-t-indigo-500"
                  : "border-4 border-blue-100 border-t-blue-600"
              }`}
            ></div>
            <p
              className={`text-lg font-medium ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Loading amazing opportunities...
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div
            className={`text-center py-20 rounded-2xl backdrop-blur-lg transition-all duration-300 ${
              darkMode
                ? "bg-slate-800/50 border border-slate-700/50"
                : "bg-white/50 border border-blue-100/50"
            }`}
          >
            <div className="text-5xl mb-4">🎯</div>
            <h3
              className={`text-2xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {jobs.length === 0 ? "No jobs available" : "No matching jobs"}
            </h3>
            <p className={`${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              {jobs.length === 0
                ? "Check back soon for exciting opportunities!"
                : "Try adjusting your search terms"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-102 ${
                  darkMode
                    ? "bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
                    : "bg-gradient-to-br from-white to-blue-50/30 border border-blue-100/50 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10"
                }`}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 50}ms forwards`,
                  opacity: 0,
                }}
              >
                {/* Hover gradient effect */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    darkMode
                      ? "bg-gradient-to-r from-indigo-600/5 to-purple-600/5"
                      : "bg-gradient-to-r from-blue-600/5 to-indigo-600/5"
                  }`}
                ></div>

                <div className="relative p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                            darkMode
                              ? "bg-gradient-to-br from-indigo-600/30 to-purple-600/30"
                              : "bg-gradient-to-br from-blue-600/20 to-indigo-600/20"
                          }`}
                        >
                          <Briefcase
                            className={
                              darkMode ? "text-indigo-400" : "text-blue-600"
                            }
                            size={24}
                          />
                        </div>
                        <div>
                          <h3
                            className={`text-xl md:text-2xl font-bold transition-colors duration-300 ${
                              darkMode
                                ? "text-white group-hover:text-indigo-400"
                                : "text-slate-900 group-hover:text-blue-600"
                            }`}
                          >
                            {job.title}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${
                              darkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            by {job.posted_by || "Recruiter"}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`line-clamp-2 mb-4 text-sm md:text-base ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                            darkMode
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-green-100/80 text-green-700 border border-green-200"
                          }`}
                        >
                          🟢 {job.status || "Active"}
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setModalOpen(true);
                        }}
                        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                          darkMode
                            ? "bg-slate-700/50 text-slate-200 hover:bg-slate-700 border border-slate-600/50 hover:border-indigo-500/50"
                            : "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        📖 Details
                      </button>
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={appliedJobs.has(job.id)}
                        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                          appliedJobs.has(job.id)
                            ? darkMode
                              ? "bg-slate-700/30 text-slate-400 border border-slate-600/30"
                              : "bg-slate-200 text-slate-500 border border-slate-300"
                            : darkMode
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50 border border-blue-300/50"
                        }`}
                      >
                        {appliedJobs.has(job.id)
                          ? "✅ Applied"
                          : "🚀 Apply Now"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <JobDetailsModal
        job={selectedJob}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        darkMode={darkMode}
        onApply={handleApply}
        isApplied={selectedJob ? appliedJobs.has(selectedJob.id) : false}
      />

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
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.4s ease-out;
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default FindJobsPage;
