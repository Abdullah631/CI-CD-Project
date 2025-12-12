import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  Menu,
  X,
  ChevronDown,
  Search,
} from "lucide-react";

export const JobPostsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    status: "active",
    requirements: {
      required_skills: [],
      required_experience_years: 0,
      required_education: "",
      required_languages: [],
      required_certifications: [],
    },
  });
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [certificationInput, setCertificationInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterAndSortJobs();
  }, [jobs, searchTerm, sortBy]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${window.API_BASE_URL}/api/recruiter/jobs/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(search) ||
          j.location.toLowerCase().includes(search) ||
          j.description.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "title":
          return a.title.localeCompare(b.title);
        case "applications":
          return (b.applications_count || 0) - (a.applications_count || 0);
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  };

  const deleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(
          `${window.API_BASE_URL}/api/recruiter/jobs/${jobId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setJobs(jobs.filter((j) => j.id !== jobId));
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  const addJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage("");
    try {
      const response = await axios.post(
        `${window.API_BASE_URL}/api/recruiter/jobs/add/`,
        jobForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmitMessage("Job posted successfully!");
      setJobForm({
        title: "",
        description: "",
        status: "active",
        requirements: {
          required_skills: [],
          required_experience_years: 0,
          required_education: "",
          required_languages: [],
          required_certifications: [],
        },
      });
      setTimeout(() => {
        setAddModalOpen(false);
        setSubmitMessage("");
        fetchJobs();
      }, 1500);
    } catch (error) {
      setSubmitMessage(
        error?.response?.data?.error || "Failed to post job. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage("");
    try {
      await axios.put(
        `${window.API_BASE_URL}/api/recruiter/jobs/${selectedJob.id}/`,
        jobForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitMessage("✅ Job updated successfully!");
      setTimeout(() => {
        setEditModalOpen(false);
        setSubmitMessage("");
        setSelectedJob(null);
        fetchJobs();
      }, 1500);
    } catch (error) {
      setSubmitMessage(
        error?.response?.data?.error ||
          "Failed to update job. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    {
      icon: Briefcase,
      label: "Active Jobs",
      value: jobs.filter((j) => j.status === "active").length,
      color: "from-blue-600 to-cyan-600",
    },
    {
      icon: Users,
      label: "Total Applications",
      value: jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0),
      color: "from-purple-600 to-pink-600",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: jobs.reduce((sum, j) => sum + (j.views_count || 0), 0),
      color: "from-green-600 to-emerald-600",
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
                <Briefcase size={24} />
              </div>
              <h1
                className={`text-2xl font-bold hidden sm:block ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Job Posts
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
                All Jobs
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-700/50"
                    : "text-slate-600 hover:bg-blue-100/50"
                }`}
              >
                Active
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddModalOpen(true)}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  darkMode
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                }`}
              >
                <Plus size={20} />
                Add Job
              </button>
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  localStorage.setItem("darkMode", !darkMode);
                }}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              {/* Add Job Button for Mobile */}
              <button
                onClick={() => setAddModalOpen(true)}
                className={`md:hidden p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                <Plus size={24} />
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
                All Jobs
              </button>
              <button
                className={`block w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-700/50"
                    : "text-slate-600 hover:bg-blue-100/50"
                }`}
              >
                Active
              </button>
              {/* Post Job Button - Feature coming soon */}
            </nav>
          )}
        </div>
      </header>

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
                placeholder="Search jobs..."
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
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Sort by Title</option>
                <option value="applications">Most Applications</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-4 border-transparent ${
                darkMode ? "border-t-indigo-500" : "border-t-blue-600"
              }`}
            ></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div
            className={`rounded-3xl border backdrop-blur p-12 text-center transition-all duration-300 ${
              darkMode
                ? "bg-slate-800/40 border-slate-700/50"
                : "bg-white/60 border-blue-100/50"
            }`}
          >
            <Briefcase
              size={48}
              className={`mx-auto mb-4 ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            />
            <p
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {searchTerm ? "No jobs match your search" : "No jobs posted yet"}
            </p>
            <button
              disabled
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold opacity-50 cursor-not-allowed ${
                darkMode
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              }`}
              title="Post job feature coming soon"
            >
              <Plus size={20} />
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, idx) => (
              <div
                key={job.id}
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
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    {/* Job Info */}
                    <div className="flex-1">
                      <h3
                        className={`text-2xl font-bold mb-2 ${
                          darkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {job.title}
                      </h3>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {job.location && (
                          <div
                            className={`flex items-center gap-1 text-sm ${
                              darkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            <MapPin size={16} />
                            {job.location}
                          </div>
                        )}
                        {job.salary && (
                          <div
                            className={`flex items-center gap-1 text-sm font-semibold ${
                              darkMode ? "text-green-400" : "text-green-600"
                            }`}
                          >
                            <DollarSign size={16} />${job.salary}
                          </div>
                        )}
                      </div>

                      {/* Description Preview */}
                      <p
                        className={`text-sm mb-3 ${
                          darkMode ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {job.description}
                      </p>

                      {/* Requirements Section */}
                      {job.requirements && (
                        <div
                          className={`mt-4 p-3 rounded-lg ${
                            darkMode ? "bg-slate-700/30" : "bg-blue-50/50"
                          }`}
                        >
                          <h4
                            className={`text-xs font-bold uppercase mb-2 ${
                              darkMode ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            Requirements
                          </h4>

                          {job.requirements.required_skills?.length > 0 && (
                            <div className="mb-2">
                              <p
                                className={`text-xs font-semibold mb-1 ${
                                  darkMode ? "text-slate-400" : "text-slate-600"
                                }`}
                              >
                                Skills:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {job.requirements.required_skills.map(
                                  (skill, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        darkMode
                                          ? "bg-indigo-600/30 text-indigo-300"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {job.requirements.required_experience_years > 0 && (
                            <p
                              className={`text-xs mb-1 ${
                                darkMode ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              <span className="font-semibold">Experience:</span>{" "}
                              {job.requirements.required_experience_years} years
                            </p>
                          )}

                          {job.requirements.required_education && (
                            <p
                              className={`text-xs mb-1 ${
                                darkMode ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              <span className="font-semibold">Education:</span>{" "}
                              {job.requirements.required_education}
                            </p>
                          )}

                          {job.requirements.required_languages?.length > 0 && (
                            <div className="mb-1">
                              <p
                                className={`text-xs font-semibold mb-1 ${
                                  darkMode ? "text-slate-400" : "text-slate-600"
                                }`}
                              >
                                Languages:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {job.requirements.required_languages.map(
                                  (lang, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        darkMode
                                          ? "bg-purple-600/30 text-purple-300"
                                          : "bg-purple-100 text-purple-700"
                                      }`}
                                    >
                                      {lang}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {job.requirements.required_certifications?.length >
                            0 && (
                            <div>
                              <p
                                className={`text-xs font-semibold mb-1 ${
                                  darkMode ? "text-slate-400" : "text-slate-600"
                                }`}
                              >
                                Certifications:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {job.requirements.required_certifications.map(
                                  (cert, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        darkMode
                                          ? "bg-green-600/30 text-green-300"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {cert}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stats and Actions */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex gap-4">
                        {job.applications_count !== undefined && (
                          <div className="text-center">
                            <p
                              className={`text-2xl font-bold ${
                                darkMode ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {job.applications_count}
                            </p>
                            <p
                              className={`text-xs font-semibold uppercase ${
                                darkMode ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              Applications
                            </p>
                          </div>
                        )}
                        {job.views_count !== undefined && (
                          <div className="text-center">
                            <p
                              className={`text-2xl font-bold ${
                                darkMode ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {job.views_count}
                            </p>
                            <p
                              className={`text-xs font-semibold uppercase ${
                                darkMode ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              Views
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setViewModalOpen(true);
                          }}
                          title="View job details"
                          className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                            darkMode
                              ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30"
                              : "bg-blue-100/50 text-blue-600 hover:bg-blue-200 border border-blue-200"
                          }`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            const defaultRequirements = {
                              required_skills: [],
                              required_experience_years: 0,
                              required_education: "",
                              required_languages: [],
                              required_certifications: [],
                            };
                            setJobForm({
                              title: job.title || "",
                              description: job.description || "",
                              status: job.status || "active",
                              requirements: job.requirements
                                ? {
                                    ...defaultRequirements,
                                    ...job.requirements,
                                    required_skills:
                                      job.requirements.required_skills || [],
                                    required_languages:
                                      job.requirements.required_languages || [],
                                    required_certifications:
                                      job.requirements
                                        .required_certifications || [],
                                  }
                                : defaultRequirements,
                            });
                            // Clear input fields
                            setSkillInput("");
                            setLanguageInput("");
                            setCertificationInput("");
                            setEditModalOpen(true);
                          }}
                          title="Edit job"
                          className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                            darkMode
                              ? "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 border border-indigo-500/30"
                              : "bg-indigo-100/50 text-indigo-600 hover:bg-indigo-200 border border-indigo-200"
                          }`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                            darkMode
                              ? "bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30"
                              : "bg-red-100/50 text-red-600 hover:bg-red-200 border border-red-200"
                          }`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Job Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div
            className={`w-full max-w-2xl my-8 rounded-3xl border shadow-2xl transform transition-all duration-300 animate-slideDown max-h-[90vh] flex flex-col ${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-blue-100"
            }`}
          >
            <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Post New Job
                </h2>
                <button
                  onClick={() => {
                    setAddModalOpen(false);
                    setSubmitMessage("");
                    setJobForm({
                      title: "",
                      description: "",
                      status: "active",
                      requirements: {
                        required_skills: [],
                        required_experience_years: 0,
                        required_education: "",
                        required_languages: [],
                        required_certifications: [],
                      },
                    });
                    setSkillInput("");
                    setLanguageInput("");
                    setCertificationInput("");
                  }}
                  className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                    darkMode
                      ? "hover:bg-slate-700 text-slate-400"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={addJob} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, title: e.target.value })
                    }
                    placeholder="e.g., Senior Frontend Developer"
                    className={`w-full px-4 py-3 rounded-xl border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                      darkMode
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50 focus:border-indigo-500"
                        : "bg-blue-50/50 border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Job Description *
                  </label>
                  <textarea
                    required
                    value={jobForm.description}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, description: e.target.value })
                    }
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows="6"
                    className={`w-full px-4 py-3 rounded-xl border font-medium transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${
                      darkMode
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50 focus:border-indigo-500"
                        : "bg-blue-50/50 border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500"
                    }`}
                  />
                </div>

                {/* Requirements Section */}
                <div
                  className={`p-4 rounded-xl border ${
                    darkMode
                      ? "bg-slate-700/30 border-slate-600"
                      : "bg-blue-50/30 border-blue-200"
                  }`}
                >
                  <h3
                    className={`text-lg font-bold mb-4 ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Job Requirements (for AI matching)
                  </h3>

                  {/* Required Skills */}
                  <div className="mb-4">
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Required Skills
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (skillInput.trim()) {
                              setJobForm({
                                ...jobForm,
                                requirements: {
                                  ...jobForm.requirements,
                                  required_skills: [
                                    ...jobForm.requirements.required_skills,
                                    skillInput.trim(),
                                  ],
                                },
                              });
                              setSkillInput("");
                            }
                          }
                        }}
                        placeholder="e.g., React, Node.js, Python (press Enter to add)"
                        className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                          darkMode
                            ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50"
                            : "bg-white border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (skillInput.trim()) {
                            setJobForm({
                              ...jobForm,
                              requirements: {
                                ...jobForm.requirements,
                                required_skills: [
                                  ...jobForm.requirements.required_skills,
                                  skillInput.trim(),
                                ],
                              },
                            });
                            setSkillInput("");
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          darkMode
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {jobForm.requirements.required_skills.map(
                        (skill, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                              darkMode
                                ? "bg-indigo-600/30 text-indigo-300"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => {
                                setJobForm({
                                  ...jobForm,
                                  requirements: {
                                    ...jobForm.requirements,
                                    required_skills:
                                      jobForm.requirements.required_skills.filter(
                                        (_, i) => i !== idx
                                      ),
                                  },
                                });
                              }}
                              className="hover:scale-110 transition-transform"
                            >
                              ×
                            </button>
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Required Experience */}
                  <div className="mb-4">
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Required Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={jobForm.requirements.required_experience_years}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          requirements: {
                            ...jobForm.requirements,
                            required_experience_years:
                              parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className={`w-full px-4 py-2 rounded-lg border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                        darkMode
                          ? "bg-slate-700/50 border-slate-600 text-white focus:ring-indigo-500/50"
                          : "bg-white border-blue-100 text-slate-900 focus:ring-blue-500/30"
                      }`}
                    />
                  </div>

                  {/* Required Education */}
                  <div className="mb-4">
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Required Education Level
                    </label>
                    <select
                      value={jobForm.requirements.required_education}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          requirements: {
                            ...jobForm.requirements,
                            required_education: e.target.value,
                          },
                        })
                      }
                      className={`w-full px-4 py-2 rounded-lg border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                        darkMode
                          ? "bg-slate-700/50 border-slate-600 text-white focus:ring-indigo-500/50"
                          : "bg-white border-blue-100 text-slate-900 focus:ring-blue-500/30"
                      }`}
                    >
                      <option value="">No specific requirement</option>
                      <option value="high school">High School</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                    </select>
                  </div>

                  {/* Required Languages */}
                  <div className="mb-4">
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Required Languages
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (languageInput.trim()) {
                              setJobForm({
                                ...jobForm,
                                requirements: {
                                  ...jobForm.requirements,
                                  required_languages: [
                                    ...jobForm.requirements.required_languages,
                                    languageInput.trim(),
                                  ],
                                },
                              });
                              setLanguageInput("");
                            }
                          }
                        }}
                        placeholder="e.g., English, Spanish (press Enter to add)"
                        className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                          darkMode
                            ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50"
                            : "bg-white border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (languageInput.trim()) {
                            setJobForm({
                              ...jobForm,
                              requirements: {
                                ...jobForm.requirements,
                                required_languages: [
                                  ...jobForm.requirements.required_languages,
                                  languageInput.trim(),
                                ],
                              },
                            });
                            setLanguageInput("");
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          darkMode
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {jobForm.requirements.required_languages.map(
                        (lang, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                              darkMode
                                ? "bg-indigo-600/30 text-indigo-300"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {lang}
                            <button
                              type="button"
                              onClick={() => {
                                setJobForm({
                                  ...jobForm,
                                  requirements: {
                                    ...jobForm.requirements,
                                    required_languages:
                                      jobForm.requirements.required_languages.filter(
                                        (_, i) => i !== idx
                                      ),
                                  },
                                });
                              }}
                              className="hover:scale-110 transition-transform"
                            >
                              ×
                            </button>
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Required Certifications */}
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Required Certifications (Optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={certificationInput}
                        onChange={(e) => setCertificationInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (certificationInput.trim()) {
                              setJobForm({
                                ...jobForm,
                                requirements: {
                                  ...jobForm.requirements,
                                  required_certifications: [
                                    ...jobForm.requirements
                                      .required_certifications,
                                    certificationInput.trim(),
                                  ],
                                },
                              });
                              setCertificationInput("");
                            }
                          }
                        }}
                        placeholder="e.g., AWS Certified, PMP (press Enter to add)"
                        className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                          darkMode
                            ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50"
                            : "bg-white border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (certificationInput.trim()) {
                            setJobForm({
                              ...jobForm,
                              requirements: {
                                ...jobForm.requirements,
                                required_certifications: [
                                  ...jobForm.requirements
                                    .required_certifications,
                                  certificationInput.trim(),
                                ],
                              },
                            });
                            setCertificationInput("");
                          }
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          darkMode
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {jobForm.requirements.required_certifications.map(
                        (cert, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                              darkMode
                                ? "bg-indigo-600/30 text-indigo-300"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {cert}
                            <button
                              type="button"
                              onClick={() => {
                                setJobForm({
                                  ...jobForm,
                                  requirements: {
                                    ...jobForm.requirements,
                                    required_certifications:
                                      jobForm.requirements.required_certifications.filter(
                                        (_, i) => i !== idx
                                      ),
                                  },
                                });
                              }}
                              className="hover:scale-110 transition-transform"
                            >
                              ×
                            </button>
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Status
                  </label>
                  <select
                    value={jobForm.status}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, status: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                      darkMode
                        ? "bg-slate-700/50 border-slate-600 text-white focus:ring-indigo-500/50 focus:border-indigo-500"
                        : "bg-blue-50/50 border-blue-100 text-slate-900 focus:ring-blue-500/30 focus:border-blue-500"
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {submitMessage && (
                  <div
                    className={`p-4 rounded-xl text-center font-semibold ${
                      submitMessage.includes("success")
                        ? darkMode
                          ? "bg-green-600/20 text-green-300 border border-green-500/30"
                          : "bg-green-100 text-green-700 border border-green-200"
                        : darkMode
                        ? "bg-red-600/20 text-red-300 border border-red-500/30"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}
              </div>

              {/* Fixed Footer with Buttons */}
              <div
                className={`p-6 border-t flex-shrink-0 ${
                  darkMode ? "border-slate-700/50" : "border-blue-100/50"
                }`}
              >
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAddModalOpen(false);
                      setSubmitMessage("");
                      setJobForm({
                        title: "",
                        description: "",
                        status: "active",
                        requirements: {
                          required_skills: [],
                          required_experience_years: 0,
                          required_education: "",
                          required_languages: [],
                          required_certifications: [],
                        },
                      });
                      setSkillInput("");
                      setLanguageInput("");
                      setCertificationInput("");
                    }}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                    }`}
                  >
                    {submitting ? "Posting..." : "Post Job"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Job Modal */}
      {viewModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div
            className={`w-full max-w-3xl my-8 rounded-3xl border shadow-2xl max-h-[90vh] flex flex-col ${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-blue-100"
            }`}
          >
            <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  📋 Job Details
                </h2>
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    setSelectedJob(null);
                  }}
                  className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                    darkMode
                      ? "hover:bg-slate-700 text-slate-400"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Job Title
                </label>
                <p
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {selectedJob.title}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Description
                </label>
                <p
                  className={`text-base ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {selectedJob.description}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Status
                </label>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                    selectedJob.status === "active"
                      ? darkMode
                        ? "bg-green-600/30 text-green-300"
                        : "bg-green-100 text-green-800"
                      : darkMode
                      ? "bg-slate-600/30 text-slate-300"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {selectedJob.status}
                </span>
              </div>

              {selectedJob.requirements && (
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-slate-700/30" : "bg-blue-50/50"
                  }`}
                >
                  <h3
                    className={`text-lg font-bold mb-3 ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Requirements
                  </h3>

                  {selectedJob.requirements.required_skills?.length > 0 && (
                    <div className="mb-3">
                      <p
                        className={`text-sm font-semibold mb-2 ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requirements.required_skills.map(
                          (skill, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-sm ${
                                darkMode
                                  ? "bg-indigo-600/30 text-indigo-300"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {selectedJob.requirements.required_experience_years > 0 && (
                    <p
                      className={`text-sm mb-2 ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      <span className="font-semibold">Experience:</span>{" "}
                      {selectedJob.requirements.required_experience_years} years
                    </p>
                  )}

                  {selectedJob.requirements.required_education && (
                    <p
                      className={`text-sm mb-2 ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      <span className="font-semibold">Education:</span>{" "}
                      {selectedJob.requirements.required_education}
                    </p>
                  )}

                  {selectedJob.requirements.required_languages?.length > 0 && (
                    <div className="mb-3">
                      <p
                        className={`text-sm font-semibold mb-2 ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requirements.required_languages.map(
                          (lang, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-sm ${
                                darkMode
                                  ? "bg-purple-600/30 text-purple-300"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {lang}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {selectedJob.requirements.required_certifications?.length >
                    0 && (
                    <div>
                      <p
                        className={`text-sm font-semibold mb-2 ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Certifications
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requirements.required_certifications.map(
                          (cert, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-sm ${
                                darkMode
                                  ? "bg-green-600/30 text-green-300"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {cert}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className={`p-6 border-t flex-shrink-0 ${
                darkMode ? "border-slate-700/50" : "border-blue-100/50"
              }`}
            >
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedJob(null);
                }}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  darkMode
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal - Reuse the same form structure as Add */}
      {editModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div
            className={`w-full max-w-2xl my-8 rounded-3xl border shadow-2xl max-h-[90vh] flex flex-col ${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-blue-100"
            }`}
          >
            <div className="p-6 border-b border-slate-700/50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  ✏️ Edit Job
                </h2>
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedJob(null);
                    setSubmitMessage("");
                  }}
                  className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                    darkMode
                      ? "hover:bg-slate-700 text-slate-400"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={updateJob} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Use same form fields as add modal - copy the form content here */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, title: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                      darkMode
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50 focus:border-indigo-500"
                        : "bg-blue-50/50 border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Job Description *
                  </label>
                  <textarea
                    required
                    value={jobForm.description}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, description: e.target.value })
                    }
                    rows="6"
                    className={`w-full px-4 py-3 rounded-xl border font-medium transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${
                      darkMode
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50 focus:border-indigo-500"
                        : "bg-blue-50/50 border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30 focus:border-blue-500"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Status
                  </label>
                  <select
                    value={jobForm.status}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, status: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                      darkMode
                        ? "bg-slate-700/50 border-slate-600 text-white focus:ring-indigo-500/50 focus:border-indigo-500"
                        : "bg-blue-50/50 border-blue-100 text-slate-900 focus:ring-blue-500/30 focus:border-blue-500"
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Requirements Section */}
                {jobForm.requirements && (
                  <div
                    className={`p-4 rounded-xl border ${
                      darkMode
                        ? "bg-slate-700/30 border-slate-600"
                        : "bg-blue-50/30 border-blue-200"
                    }`}
                  >
                    <h3
                      className={`text-lg font-bold mb-4 ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Job Requirements (for AI matching)
                    </h3>

                    {/* Required Skills */}
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-semibold mb-2 ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Required Skills
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (skillInput.trim()) {
                                setJobForm({
                                  ...jobForm,
                                  requirements: {
                                    ...jobForm.requirements,
                                    required_skills: [
                                      ...jobForm.requirements.required_skills,
                                      skillInput.trim(),
                                    ],
                                  },
                                });
                                setSkillInput("");
                              }
                            }
                          }}
                          placeholder="e.g., React, Python (press Enter to add)"
                          className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                            darkMode
                              ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50"
                              : "bg-white border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (skillInput.trim()) {
                              setJobForm({
                                ...jobForm,
                                requirements: {
                                  ...jobForm.requirements,
                                  required_skills: [
                                    ...jobForm.requirements.required_skills,
                                    skillInput.trim(),
                                  ],
                                },
                              });
                              setSkillInput("");
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            darkMode
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                              : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {jobForm.requirements.required_skills.map(
                          (skill, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                                darkMode
                                  ? "bg-indigo-600/30 text-indigo-300"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => {
                                  setJobForm({
                                    ...jobForm,
                                    requirements: {
                                      ...jobForm.requirements,
                                      required_skills:
                                        jobForm.requirements.required_skills.filter(
                                          (_, i) => i !== idx
                                        ),
                                    },
                                  });
                                }}
                                className="hover:scale-110 transition-transform"
                              >
                                ×
                              </button>
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Experience Years */}
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-semibold mb-2 ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Required Experience (Years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={
                          jobForm.requirements?.required_experience_years || 0
                        }
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            requirements: {
                              ...jobForm.requirements,
                              required_experience_years:
                                parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className={`w-full px-4 py-2 rounded-lg border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                          darkMode
                            ? "bg-slate-700/50 border-slate-600 text-white focus:ring-indigo-500/50"
                            : "bg-white border-blue-100 text-slate-900 focus:ring-blue-500/30"
                        }`}
                      />
                    </div>

                    {/* Education */}
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-semibold mb-2 ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Required Education
                      </label>
                      <input
                        type="text"
                        value={jobForm.requirements?.required_education || ""}
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            requirements: {
                              ...jobForm.requirements,
                              required_education: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g., Bachelor's in Computer Science"
                        className={`w-full px-4 py-2 rounded-lg border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                          darkMode
                            ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50"
                            : "bg-white border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30"
                        }`}
                      />
                    </div>

                    {/* Languages */}
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-semibold mb-2 ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Required Languages
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={languageInput}
                          onChange={(e) => setLanguageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (languageInput.trim()) {
                                setJobForm({
                                  ...jobForm,
                                  requirements: {
                                    ...jobForm.requirements,
                                    required_languages: [
                                      ...jobForm.requirements
                                        .required_languages,
                                      languageInput.trim(),
                                    ],
                                  },
                                });
                                setLanguageInput("");
                              }
                            }
                          }}
                          placeholder="e.g., English, Spanish"
                          className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                            darkMode
                              ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50"
                              : "bg-white border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (languageInput.trim()) {
                              setJobForm({
                                ...jobForm,
                                requirements: {
                                  ...jobForm.requirements,
                                  required_languages: [
                                    ...jobForm.requirements.required_languages,
                                    languageInput.trim(),
                                  ],
                                },
                              });
                              setLanguageInput("");
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            darkMode
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                              : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {jobForm.requirements.required_languages.map(
                          (lang, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                                darkMode
                                  ? "bg-purple-600/30 text-purple-300"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {lang}
                              <button
                                type="button"
                                onClick={() => {
                                  setJobForm({
                                    ...jobForm,
                                    requirements: {
                                      ...jobForm.requirements,
                                      required_languages:
                                        jobForm.requirements.required_languages.filter(
                                          (_, i) => i !== idx
                                        ),
                                    },
                                  });
                                }}
                                className="hover:scale-110 transition-transform"
                              >
                                ×
                              </button>
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <label
                        className={`block text-sm font-semibold mb-2 ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        Required Certifications
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={certificationInput}
                          onChange={(e) =>
                            setCertificationInput(e.target.value)
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (certificationInput.trim()) {
                                setJobForm({
                                  ...jobForm,
                                  requirements: {
                                    ...jobForm.requirements,
                                    required_certifications: [
                                      ...jobForm.requirements
                                        .required_certifications,
                                      certificationInput.trim(),
                                    ],
                                  },
                                });
                                setCertificationInput("");
                              }
                            }
                          }}
                          placeholder="e.g., AWS Certified, PMP"
                          className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${
                            darkMode
                              ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-indigo-500/50"
                              : "bg-white border-blue-100 text-slate-900 placeholder-slate-500 focus:ring-blue-500/30"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (certificationInput.trim()) {
                              setJobForm({
                                ...jobForm,
                                requirements: {
                                  ...jobForm.requirements,
                                  required_certifications: [
                                    ...jobForm.requirements
                                      .required_certifications,
                                    certificationInput.trim(),
                                  ],
                                },
                              });
                              setCertificationInput("");
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            darkMode
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                              : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {jobForm.requirements.required_certifications.map(
                          (cert, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                                darkMode
                                  ? "bg-green-600/30 text-green-300"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {cert}
                              <button
                                type="button"
                                onClick={() => {
                                  setJobForm({
                                    ...jobForm,
                                    requirements: {
                                      ...jobForm.requirements,
                                      required_certifications:
                                        jobForm.requirements.required_certifications.filter(
                                          (_, i) => i !== idx
                                        ),
                                    },
                                  });
                                }}
                                className="hover:scale-110 transition-transform"
                              >
                                ×
                              </button>
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {submitMessage && (
                  <div
                    className={`p-4 rounded-xl text-center font-semibold ${
                      submitMessage.includes("success")
                        ? darkMode
                          ? "bg-green-600/20 text-green-300 border border-green-500/30"
                          : "bg-green-100 text-green-700 border border-green-200"
                        : darkMode
                        ? "bg-red-600/20 text-red-300 border border-red-500/30"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}
              </div>

              <div
                className={`p-6 border-t flex-shrink-0 ${
                  darkMode ? "border-slate-700/50" : "border-blue-100/50"
                }`}
              >
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModalOpen(false);
                      setSelectedJob(null);
                      setSubmitMessage("");
                    }}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                    }`}
                  >
                    {submitting ? "Updating..." : "Update Job"}
                  </button>
                </div>
              </div>
            </form>
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Custom Scrollbar Styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: ${
            darkMode ? "rgba(51, 65, 85, 0.3)" : "rgba(226, 232, 240, 0.5)"
          };
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: ${
            darkMode ? "rgba(99, 102, 241, 0.5)" : "rgba(59, 130, 246, 0.5)"
          };
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: ${
            darkMode ? "rgba(99, 102, 241, 0.7)" : "rgba(59, 130, 246, 0.7)"
          };
        }
      `}</style>
    </div>
  );
};

export default JobPostsPage;
