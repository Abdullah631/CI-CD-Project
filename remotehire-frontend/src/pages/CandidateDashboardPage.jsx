import React, { useEffect, useState } from "react";
import axios from "axios";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
// icons: email for applications, work for open positions
import CandidateNav from "../components/CandidateNav";
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

export default function CandidateDashboardPage() {
  const [userName, setUserName] = useState("");
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  /* ================= USER ================= */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) return (window.location.href = "/#/signin");
    const user = JSON.parse(u);
    if (user.role !== "candidate") window.location.href = "/#/dashboard";
    setUserName(user.username || "User");
  }, []);

  /* ================= STATS ================= */
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoadingStats(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/candidate/dashboard/stats/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplicationsCount(res.data.applications_count || 0);
        setActiveJobsCount(res.data.active_jobs_count || 0);
      } catch {
        setError("Failed to load dashboard stats");
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, [token]);

  /* ================= APPLICATIONS ================= */
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoadingApps(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/candidate/applications/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplications(res.data || []);
      } catch {
        setError("Failed to load applications");
      } finally {
        setLoadingApps(false);
      }
    };
    load();
  }, [token]);

  const withdraw = async (id) => {
    if (!window.confirm("Withdraw this application?")) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/api/candidate/applications/${id}/withdraw/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Application withdrawn successfully");
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setApplicationsCount((c) => c - 1);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to withdraw application");
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${dashImg})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <CandidateNav userName={userName} currentPage="dashboard" />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* ================= HEADER ================= */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-[#6E4B2C]/70">
              {new Date().toDateString()}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-[#6E4B2C]">
            {greeting()},{" "}
            <span style={{ color: theme.cinnamon }}>{userName}</span>
          </h1>
          <p className="mt-2 text-[#6E4B2C]/70">
            Track your applications and job progress
          </p>
        </header>

        {/* ================= ALERTS ================= */}
        {error && <Alert color="#dc2626">{error}</Alert>}
        {success && <Alert color="#16a34a">{success}</Alert>}

        {/* ================= STATS ================= */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <StatCard
            label="Applications Sent"
            value={applicationsCount}
            loading={loadingStats}
            accent={theme.cinnamon}
          />
          <StatCard
            label="Open Positions"
            value={activeJobsCount}
            loading={loadingStats}
            accent={theme.sage}
          />
        </div>

        {/* ================= APPLICATIONS ================= */}
        <div className="rounded-3xl overflow-hidden bg-white/80 border border-[#E3D7C7]">
          <div className="px-6 py-4 flex justify-between items-center bg-[#EFE7DA]">
            <h2 className="text-xl font-bold text-[#6E4B2C]">
              My Applications
            </h2>
            <span className="text-sm text-[#6E4B2C]/70">
              {applications.length} total
            </span>
          </div>

          {loadingApps ? (
            <Loader />
          ) : applications.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 flex justify-between gap-4 hover:bg-[#FAF6EF] transition"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#6E4B2C]">
                      {app.job_title}
                    </h3>
                    <p className="text-sm text-[#6E4B2C]/70 line-clamp-1">
                      {app.job_description}
                    </p>

                    <div className="flex gap-4 mt-2 text-sm text-[#6E4B2C]/60">
                      <span className="flex items-center gap-1">
                        {app.recruiter}
                      </span>
                      <span className="flex items-center gap-1">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => withdraw(app.id)}
                    className="p-3 rounded-xl text-red-600 bg-red-100 hover:scale-110 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= FOOTER TIP ================= */}
        <div className="mt-8 p-4 rounded-xl text-center bg-[#EFE7DA]">
          <p className="text-sm text-[#6E4B2C]/70">
            💡 Keep your profile updated to increase your hiring chances
          </p>
        </div>
      </main>
    </div>
  );
}

/* ================= HELPERS ================= */

const Alert = ({ children, color }) => (
  <div
    className="mb-6 p-4 rounded-xl flex items-center gap-2 font-semibold"
    style={{ background: `${color}15`, color }}
  >
    <span style={{ fontSize: 14 }}>✅</span>
    {children}
  </div>
);

const StatCard = ({ label, value, loading, icon: Icon, accent }) => (
  <div className="p-6 rounded-3xl bg-white/80 border border-[#E3D7C7] hover:shadow-lg transition">
    <div className="flex justify-between">
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: accent }}>
          {label}
        </p>
        {loading ? (
          <div className="h-10 w-16 rounded bg-[#EFE7DA]" />
        ) : (
          <p className="text-4xl font-bold text-[#6E4B2C]">{value}</p>
        )}
      </div>
      <div
        className="p-4 rounded-2xl flex items-center justify-center"
        style={{ background: accent, color: "#fff" }}
      >
        {label && label.includes("Applications") ? (
          <EmailIcon style={{ fontSize: 26, color: "#fff" }} />
        ) : (
          <WorkIcon style={{ fontSize: 26, color: "#fff" }} />
        )}
      </div>
    </div>
  </div>
);

const Loader = () => (
  <div className="py-16 flex justify-center">
    <div
      className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: theme.cinnamon }}
    />
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <p className="font-semibold text-[#6E4B2C] mb-2">No applications yet</p>
    <a
      href="/#/find-jobs"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
      style={{ background: theme.cinnamon, color: theme.cream }}
    >
      Browse Jobs
    </a>
  </div>
);
