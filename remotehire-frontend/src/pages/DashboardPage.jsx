import React, { useState, useEffect } from "react";
import dashImg from "../assets/dash.jpg";
import { API_BASE_URL } from "../config";
import PostAddIcon from "@mui/icons-material/PostAdd";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import CloseIcon from "@mui/icons-material/Close";
// icons: post, chart, close for dashboard
import RecruiterNav from "../components/RecruiterNav";

/* ================= THEME ================= */
const theme = {
  sage: "#B7C7B1",
  cinnamon: "#B87B4B",
  sand: "#CDB08E",
  cream: "#FBF6E6",
  clay: "#6E4B2C",
};

/* ================= DASHBOARD ================= */
export default function DashboardPage() {
  const [userName, setUserName] = useState("User");
  const [stats, setStats] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    location: "",
    employment_type: "",
    level: "",
    status: "active",
    requirements: {
      required_skills: [],
      required_experience_years: 0,
      required_education: "",
      required_languages: [],
      required_certifications: [],
    },
  });

  /* ================= USER ================= */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return (window.location.href = "/#/signin");
    try {
      const u = JSON.parse(stored);
      setUserName(u.username || "User");
      if ((u.role || "candidate") === "candidate")
        window.location.href = "/#/candidate-dashboard";
    } catch {}
  }, []);

  /* ================= FETCH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    const load = async () => {
      try {
        setLoading(true);
        const [statsRes, recentRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/recruiter/dashboard/stats/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/recruiter/recent-applications/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const s = await statsRes.json();
        const r = recentRes.ok ? await recentRes.json() : [];

        setStats([
          { label: "Active Jobs", value: s.active_jobs || 0 },
          { label: "Candidates", value: s.active_candidates || 0 },
          { label: "Applications", value: s.total_applications || 0 },
          { label: "Interviews", value: s.interviews_scheduled || 0 },
          { label: "Offers", value: s.offers_sent || 0 },
        ]);

        setRecentApplicants(r || []);
        setError("");
      } catch (e) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
    const poll = setInterval(load, 30000);
    return () => clearInterval(poll);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  };

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
      <RecruiterNav currentPage="dashboard" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div>
            <p className="text-sm text-[#6E4B2C]/70">
              {new Date().toLocaleDateString()}
            </p>
            <h1 className="text-3xl font-bold text-[#6E4B2C]">
              {greeting()}, {userName}
            </h1>
            <p className="text-sm text-[#6E4B2C]/70 mt-1">
              Overview of your hiring activity
            </p>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="px-5 py-3 rounded-xl font-semibold inline-flex items-center"
            style={{
              background: theme.cinnamon,
              color: theme.cream,
            }}
          >
            <PostAddIcon style={{ fontSize: 20, marginRight: 8 }} />
            Post Job
          </button>
        </div>

        {/* ================= STATES ================= */}
        {loading ? (
          <p className="text-center text-[#6E4B2C]">Loading dashboard…</p>
        ) : error ? (
          <div className="rounded-xl p-4 bg-red-100 text-red-700">{error}</div>
        ) : (
          <>
            {/* ================= STATS ================= */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-6 hover:shadow-xl transition"
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

            {/* ================= CONTENT ================= */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Applicants */}
              <div
                className="rounded-3xl p-6"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: `1px solid ${theme.sand}`,
                }}
              >
                <h3 className="text-xl font-bold text-[#6E4B2C] mb-4">
                  Recent Applicants
                </h3>

                {recentApplicants.length === 0 ? (
                  <p className="text-sm text-[#6E4B2C]/60">
                    No recent applicants
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentApplicants.slice(0, 4).map((a) => (
                      <div
                        key={a.id}
                        className="flex justify-between items-center p-3 rounded-xl"
                        style={{ background: theme.cream }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                            style={{
                              background: theme.cinnamon,
                              color: theme.cream,
                            }}
                          >
                            {(a.name || "?")[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#6E4B2C]">
                              {a.name}
                            </p>
                            <p className="text-xs text-[#6E4B2C]/60">
                              Applied{" "}
                              {new Date(a.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="px-3 py-2 rounded-lg"
                            style={{ background: theme.sand }}
                          >
                            Message
                          </button>
                          <button
                            className="px-3 py-2 rounded-lg"
                            style={{
                              background: theme.cinnamon,
                              color: theme.cream,
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div
                className="rounded-3xl p-6"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: `1px solid ${theme.sand}`,
                }}
              >
                <h3 className="text-xl font-bold text-[#6E4B2C] mb-4">
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="w-full px-4 py-3 rounded-xl font-semibold"
                    style={{
                      background: theme.cinnamon,
                      color: theme.cream,
                    }}
                  >
                    <span className="inline-flex items-center">
                      <PostAddIcon style={{ fontSize: 18, marginRight: 8 }} />
                      Post New Job
                    </span>
                  </button>

                  <a
                    href="/#/recruiter-analytics"
                    className="block text-center px-4 py-3 rounded-xl font-semibold"
                    style={{
                      background: theme.cream,
                      color: theme.clay,
                      border: `1px solid ${theme.sand}`,
                    }}
                  >
                    <span className="inline-flex items-center justify-center">
                      <InsertChartIcon
                        style={{ fontSize: 18, marginRight: 8 }}
                      />
                      View Analytics
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ================= POST JOB MODAL ================= */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPostModal(false)}
          />

          <div
            className="relative w-full max-w-xl p-6 rounded-3xl"
            style={{ background: theme.cream }}
          >
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-[#6E4B2C]">
                Post a New Job
              </h3>
              <button
                onClick={() => setShowPostModal(false)}
                aria-label="Close modal"
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>

            <input
              placeholder="Job title"
              className="w-full p-3 rounded-xl border mb-3"
              value={postForm.title}
              onChange={(e) =>
                setPostForm({ ...postForm, title: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              rows={5}
              className="w-full p-3 rounded-xl border mb-4"
              value={postForm.description}
              onChange={(e) =>
                setPostForm({
                  ...postForm,
                  description: e.target.value,
                })
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                placeholder="Location (e.g. Remote, London)"
                className="w-full p-3 rounded-xl border"
                value={postForm.location}
                onChange={(e) =>
                  setPostForm({ ...postForm, location: e.target.value })
                }
              />

              <input
                placeholder="Employment type (Full-time, Part-time)"
                className="w-full p-3 rounded-xl border"
                value={postForm.employment_type}
                onChange={(e) =>
                  setPostForm({ ...postForm, employment_type: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                placeholder="Level (e.g. Senior, Mid, Junior)"
                className="w-full p-3 rounded-xl border"
                value={postForm.level}
                onChange={(e) =>
                  setPostForm({ ...postForm, level: e.target.value })
                }
              />

              <select
                className="w-full p-3 rounded-xl border"
                value={postForm.status}
                onChange={(e) =>
                  setPostForm({ ...postForm, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                placeholder="Required skills (comma separated)"
                className="w-full p-3 rounded-xl border"
                value={(postForm.requirements?.required_skills || []).join(
                  ", "
                )}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    requirements: {
                      ...(postForm.requirements || {}),
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
                value={postForm.requirements?.required_experience_years || 0}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    requirements: {
                      ...(postForm.requirements || {}),
                      required_experience_years: parseInt(
                        e.target.value || 0,
                        10
                      ),
                    },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <input
                placeholder="Education (e.g. BSc Computer Science)"
                className="w-full p-3 rounded-xl border"
                value={postForm.requirements?.required_education || ""}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    requirements: {
                      ...(postForm.requirements || {}),
                      required_education: e.target.value,
                    },
                  })
                }
              />

              <input
                placeholder="Languages (comma separated)"
                className="w-full p-3 rounded-xl border"
                value={(postForm.requirements?.required_languages || []).join(
                  ", "
                )}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    requirements: {
                      ...(postForm.requirements || {}),
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
              className="w-full p-3 rounded-xl border mb-4"
              value={(
                postForm.requirements?.required_certifications || []
              ).join(", ")}
              onChange={(e) =>
                setPostForm({
                  ...postForm,
                  requirements: {
                    ...(postForm.requirements || {}),
                    required_certifications: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-xl font-semibold"
                style={{
                  background: theme.cinnamon,
                  color: theme.cream,
                }}
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    // use recruiter add endpoint to include full job schema
                    const res = await fetch(
                      `${API_BASE_URL}/api/recruiter/jobs/add/`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(postForm),
                      }
                    );
                    if (!res.ok) throw new Error();
                    window.location.href = "/#/job-posts";
                  } catch {
                    alert("Failed to post job");
                  }
                }}
              >
                Post Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
