import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import InsertChartIcon from "@mui/icons-material/InsertChart";
// small icons: search and stat visuals
import RecruiterNav from "../components/RecruiterNav";
import JobDetailsModalNew from "../components/JobDetailsModalNew";
import CloseIcon from "@mui/icons-material/Close";
import dashImg from "../assets/dash.jpg";
import { API_BASE_URL } from "../config";

/* ================= THEME ================= */
const theme = {
  sage: "#B7C7B1",
  cinnamon: "#B87B4B",
  sand: "#CDB08E",
  cream: "#FBF6E6",
  clay: "#6E4B2C",
};

/* ================= CONSTANTS ================= */
const emptyRequirements = {
  required_skills: [],
  required_experience_years: 0,
  required_education: "",
  required_languages: [],
  required_certifications: [],
};

const emptyJob = {
  title: "",
  description: "",
  status: "active",
  requirements: emptyRequirements,
};

/* ================= COMPONENT ================= */
export default function JobPostsPage() {
  const token = localStorage.getItem("token");

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const [addOpen, setAddOpen] = useState(false);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [editingJobId, setEditingJobId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/recruiter/jobs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER & SORT ================= */
  useEffect(() => {
    let data = [...jobs];

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (j) =>
          j.title?.toLowerCase().includes(s) ||
          j.description?.toLowerCase().includes(s)
      );
    }

    data.sort((a, b) => {
      if (sortBy === "latest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

    setFilteredJobs(data);
  }, [jobs, search, sortBy]);

  /* ================= ACTIONS ================= */
  const addJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (editingJobId) {
        await axios.put(
          `${API_BASE_URL}/api/recruiter/jobs/${editingJobId}/`,
          jobForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("✨ Job updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/api/recruiter/jobs/add/`, jobForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage("✨ Job posted successfully");
      }
      setTimeout(() => {
        setAddOpen(false);
        setJobForm(emptyJob);
        setEditingJobId(null);
        fetchJobs();
        setMessage("");
      }, 800);
    } catch {
      setMessage("❌ Failed to save job");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (job) => {
    setJobForm({
      title: job.title || "",
      description: job.description || "",
      status: job.status || "active",
      requirements: {
        required_skills: job.requirements?.required_skills || [],
        required_experience_years:
          job.requirements?.required_experience_years || 0,
        required_education: job.requirements?.required_education || "",
        required_languages: job.requirements?.required_languages || [],
        required_certifications:
          job.requirements?.required_certifications || [],
      },
      location: job.location || "",
      employment_type: job.employment_type || "",
      level: job.level || "",
    });
    setEditingJobId(job.id || null);
    setMessage("");
    setAddOpen(true);
  };

  const closeModal = () => {
    setAddOpen(false);
    setJobForm(emptyJob);
    setEditingJobId(null);
    setMessage("");
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    await axios.delete(`${API_BASE_URL}/api/recruiter/jobs/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  /* ================= STATS ================= */
  const stats = [
    {
      label: "Active Jobs",
      value: jobs.filter((j) => j.status === "active").length,
    },
    {
      label: "Applications",
      value: jobs.reduce((s, j) => s + (j.applications_count || 0), 0),
    },
    {
      label: "Views",
      value: jobs.reduce((s, j) => s + (j.views_count || 0), 0),
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${dashImg})`,
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <RecruiterNav currentPage="jobs" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* ================= STATS ================= */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-3xl p-6 transition hover:shadow-xl"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: `1px solid ${theme.sand}`,
              }}
            >
              <div className="mb-3">
                <InsertChartIcon
                  style={{ fontSize: 28, color: theme.cinnamon }}
                />
              </div>
              <p className="text-sm text-[#6E4B2C]/70">{s.label}</p>
              <p className="text-3xl font-bold text-[#6E4B2C]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ================= CONTROLS ================= */}
        <div
          className="rounded-3xl p-6 mb-8 grid md:grid-cols-3 gap-4"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: `1px solid ${theme.sand}`,
          }}
        >
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold"
            style={{
              background: theme.cinnamon,
              color: theme.cream,
            }}
          >
            Post Job
          </button>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E4B2C]">
              <SearchIcon style={{ fontSize: 18 }} />
            </div>
            <input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 py-3 rounded-xl border outline-none"
              style={{
                background: theme.cream,
                borderColor: theme.sand,
                color: theme.clay,
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl px-4 py-3 border"
            style={{
              background: theme.cream,
              borderColor: theme.sand,
              color: theme.clay,
            }}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title</option>
          </select>
        </div>

        {/* ================= JOB LIST ================= */}
        {loading ? (
          <p className="text-center text-[#6E4B2C]">Loading jobs…</p>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center text-[#6E4B2C]/70">No jobs found</p>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-3xl p-6 transition hover:shadow-xl"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${theme.sand}`,
                }}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#6E4B2C]">
                      {job.title}
                    </h3>
                    <p className="text-sm text-[#6E4B2C]/70 mt-1 line-clamp-2">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setDetailsOpen(true);
                      }}
                      className="px-3 py-2 rounded-lg"
                      style={{ background: theme.sand }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => startEdit(job)}
                      className="px-3 py-2 rounded-lg"
                      style={{ background: theme.cinnamon, color: theme.cream }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= ADD JOB MODAL ================= */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div
            className="relative w-full max-w-lg p-4 rounded-3xl"
            style={{ background: theme.cream }}
          >
            <div className="overflow-y-auto max-h-[75vh] p-2 md:p-4">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold text-[#6E4B2C]">
                  {editingJobId ? "Edit Job" : "Post New Job"}
                </h2>
                <button onClick={closeModal}>
                  <CloseIcon style={{ fontSize: 18 }} />
                </button>
              </div>

              <form onSubmit={addJob} className="space-y-4">
                <input
                  required
                  placeholder="Job title"
                  className="w-full p-3 rounded-xl border"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, title: e.target.value })
                  }
                />

                <textarea
                  required
                  rows={4}
                  placeholder="Job description"
                  className="w-full p-3 rounded-xl border"
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      description: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="Location (e.g. Remote, London)"
                    className="w-full p-3 rounded-xl border"
                    value={jobForm.location || ""}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, location: e.target.value })
                    }
                  />

                  <input
                    placeholder="Employment type (Full-time, Part-time)"
                    className="w-full p-3 rounded-xl border"
                    value={jobForm.employment_type || ""}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        employment_type: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="Level (e.g. Senior, Mid, Junior)"
                    className="w-full p-3 rounded-xl border"
                    value={jobForm.level || ""}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, level: e.target.value })
                    }
                  />

                  <select
                    className="w-full p-3 rounded-xl border"
                    value={jobForm.status || "active"}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="Required skills (comma separated)"
                    className="w-full p-3 rounded-xl border"
                    value={(jobForm.requirements?.required_skills || []).join(
                      ", "
                    )}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        requirements: {
                          ...(jobForm.requirements || {}),
                          required_skills: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                  />

                  <input
                    type="number"
                    min={0}
                    placeholder="Experience years"
                    className="w-full p-3 rounded-xl border"
                    value={jobForm.requirements?.required_experience_years || 0}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        requirements: {
                          ...(jobForm.requirements || {}),
                          required_experience_years: parseInt(
                            e.target.value || 0,
                            10
                          ),
                        },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="Education (e.g. BSc Computer Science)"
                    className="w-full p-3 rounded-xl border"
                    value={jobForm.requirements?.required_education || ""}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        requirements: {
                          ...(jobForm.requirements || {}),
                          required_education: e.target.value,
                        },
                      })
                    }
                  />

                  <input
                    placeholder="Languages (comma separated)"
                    className="w-full p-3 rounded-xl border"
                    value={(
                      jobForm.requirements?.required_languages || []
                    ).join(", ")}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        requirements: {
                          ...(jobForm.requirements || {}),
                          required_languages: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                  />
                </div>

                <input
                  placeholder="Certifications (comma separated)"
                  className="w-full p-3 rounded-xl border"
                  value={(
                    jobForm.requirements?.required_certifications || []
                  ).join(", ")}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      requirements: {
                        ...(jobForm.requirements || {}),
                        required_certifications: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                />

                {message && (
                  <p className="text-sm text-center text-[#6E4B2C]">
                    {message}
                  </p>
                )}

                <button
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-semibold"
                  style={{
                    background: theme.cinnamon,
                    color: theme.cream,
                  }}
                >
                  {submitting
                    ? editingJobId
                      ? "Updating…"
                      : "Posting…"
                    : editingJobId
                    ? "Update Job"
                    : "Post Job"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <JobDetailsModalNew
        job={selectedJob}
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedJob(null);
        }}
        onApply={() => {}}
        isApplied={false}
      />
    </div>
  );
}
