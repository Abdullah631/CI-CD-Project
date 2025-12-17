import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import WorkIcon from "@mui/icons-material/Work";
// small icons: search and job type
import CandidateNav from "../components/CandidateNav";
import dashImg from "../assets/dash.jpg";
import JobDetailsModalNew from "../components/JobDetailsModalNew";
import { API_BASE_URL } from "../config";

/* ================= THEME ================= */
const theme = {
  sage: "#B7C7B1",
  cinnamon: "#B87B4B",
  sand: "#CDB08E",
  cream: "#FBF6E6",
  clay: "#6E4B2C",
};

export default function FindJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  /* ================= USER ================= */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) return (window.location.href = "/#/signin");
    const user = JSON.parse(u);
    if (user.role !== "candidate") window.location.href = "/#/dashboard";
    setUserName(user.username || "User");
  }, []);

  /* ================= FETCH JOBS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/jobs/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const active = (res.data || []).filter(
          (j) => (j.status || "").toLowerCase() === "active"
        );
        setJobs(active);

        if (token) {
          const apps = await axios.get(
            `${API_BASE_URL}/api/candidate/applications/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAppliedJobs(new Set((apps.data || []).map((a) => a.job_id)));
        }
      } catch {
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  /* ================= APPLY ================= */
  const apply = async (id) => {
    if (!token) return setError("Please login to apply");
    try {
      await axios.post(
        `${API_BASE_URL}/api/jobs/${id}/apply/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppliedJobs((p) => new Set([...p, id]));
      setSuccess("Application submitted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to apply for job");
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.posted_by || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${dashImg})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <CandidateNav userName={userName} currentPage="findjobs" />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* ================= SEARCH ================= */}
        <div className="mb-10">
          <div className="p-5 rounded-2xl bg-white/80 border border-[#E3D7C7] flex items-center gap-3">
            <div
              className="p-3 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.cinnamon}, ${theme.sage})`,
              }}
            >
              <SearchIcon style={{ fontSize: 18, color: "#fff" }} />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs or companies..."
              className="w-full bg-transparent outline-none text-lg text-[#6E4B2C]"
            />
          </div>
        </div>

        {/* ================= ALERTS ================= */}
        {error && <Alert color="#dc2626">{error}</Alert>}
        {success && <Alert color="#16a34a">{success}</Alert>}

        {/* ================= CONTENT ================= */}
        {loading ? (
          <Loader />
        ) : filteredJobs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => {
              const applied = appliedJobs.has(job.id);
              return (
                <div
                  key={job.id}
                  className="p-6 rounded-3xl bg-white/85 border border-[#E3D7C7] hover:shadow-lg transition"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-3">
                        <div
                          className="p-3 rounded-xl flex items-center justify-center"
                          style={{ background: theme.sand }}
                        >
                          <WorkIcon
                            style={{ fontSize: 18, color: "#6E4B2C" }}
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#6E4B2C]">
                            {job.title}
                          </h3>
                          <p className="text-sm text-[#6E4B2C]/70">
                            {job.posted_by || "Recruiter"}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-[#6E4B2C]/80 line-clamp-3">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:min-w-[160px]">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl font-semibold border border-[#E3D7C7] text-[#6E4B2C]"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => apply(job.id)}
                        disabled={applied}
                        className="px-4 py-2 rounded-xl font-semibold"
                        style={{
                          background: applied ? "#EFE7DA" : theme.cinnamon,
                          color: applied ? theme.clay : theme.cream,
                          cursor: applied ? "not-allowed" : "pointer",
                        }}
                      >
                        {applied ? "Applied ✓" : "Apply Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <JobDetailsModalNew
        job={selectedJob}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={apply}
        isApplied={selectedJob ? appliedJobs.has(selectedJob.id) : false}
      />
    </div>
  );
}

/* ================= HELPERS ================= */

const Alert = ({ children, color }) => (
  <div
    className="mb-6 p-4 rounded-xl font-semibold"
    style={{ background: `${color}15`, color }}
  >
    {children}
  </div>
);

const Loader = () => (
  <div className="py-20 flex justify-center">
    <div
      className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: theme.cinnamon }}
    />
  </div>
);

const EmptyState = () => (
  <div className="text-center py-20">
    <h3 className="text-2xl font-bold text-[#6E4B2C] mb-2">No jobs found</h3>
    <p className="text-[#6E4B2C]/70 mb-6">
      Try adjusting your search or check back later
    </p>
    <a
      href="/#/candidate-dashboard"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
      style={{ background: theme.cinnamon, color: theme.cream }}
    >
      Go to Dashboard
    </a>
  </div>
);
