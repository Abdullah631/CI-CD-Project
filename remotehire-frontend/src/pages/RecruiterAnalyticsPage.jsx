import React, { useState, useEffect } from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// icons: small metric icons for analytics cards
import RecruiterNav from "../components/RecruiterNav";
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

/* ================= COMPONENT ================= */
export default function RecruiterAnalyticsPage() {
  const [userName, setUserName] = useState("User");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("30d");

  /* ================= USER ================= */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUserName(u.username || "User");
      } catch {}
    }
  }, []);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_BASE_URL}/api/recruiter/analytics/?range=${range}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch analytics");
        const data = await res.json();

        setAnalytics({
          pipelineStatus: data.pipelineStatus || [],
          topJobs: data.topJobs || [],
          metrics: data.metrics || [],
        });

        setError("");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [range]);

  /* ================= EXPORT ================= */
  const exportTopJobs = () => {
    if (!analytics?.topJobs?.length) return alert("No data to export");

    const rows = [
      ["Job Title", "Applications"],
      ...analytics.topJobs.map((j) => [j.title, j.applications]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `top-jobs-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================= FALLBACK ================= */
  const data = analytics || {
    pipelineStatus: [],
    topJobs: [],
    metrics: [],
  };

  const displayData = analyticsData || defaultAnalyticsData;

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
      <RecruiterNav currentPage="analytics" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* ================= HEADER ================= */}
        <div
          className="rounded-3xl p-6 mb-10 flex flex-col md:flex-row justify-between gap-4"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: `1px solid ${theme.sand}`,
          }}
        >
          <div>
            <h2 className="text-3xl font-bold text-[#6E4B2C]">
              Welcome back, {userName} 👋
            </h2>
            <p className="text-sm text-[#6E4B2C]/70 mt-1">
              Recruitment insights & performance overview
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-4 py-2 rounded-xl border"
              style={{
                background: theme.cream,
                borderColor: theme.sand,
                color: theme.clay,
              }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>

            <button
              onClick={exportTopJobs}
              className="px-4 py-2 rounded-xl font-semibold"
              style={{
                background: theme.cinnamon,
                color: theme.cream,
              }}
            >
              Export
            </button>
          </div>
        </div>

        {/* ================= STATES ================= */}
        {loading && (
          <p className="text-center text-[#6E4B2C]">Loading analytics…</p>
        )}

        {error && (
          <div className="rounded-2xl p-4 bg-red-100 text-red-700">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* ================= METRICS ================= */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {data.metrics.map((m, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-6 hover:shadow-xl transition"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: `1px solid ${theme.sand}`,
                  }}
                >
                  <div className="mb-3">
                    <TrendingUpIcon
                      style={{ fontSize: 28, color: theme.cinnamon }}
                    />
                  </div>
                  <p className="text-sm text-[#6E4B2C]/70">{m.label}</p>
                  <p className="text-3xl font-bold text-[#6E4B2C]">{m.value}</p>
                  <p className="text-sm text-[#B87B4B] mt-1">{m.change}</p>
                </div>
              ))}
            </div>

            {/* ================= CHARTS ================= */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pipeline */}
              <div
                className="rounded-3xl p-6"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: `1px solid ${theme.sand}`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold text-[#6E4B2C]">
                    Pipeline Status
                  </h3>
                </div>

                {data.pipelineStatus.map((p, i) => {
                  const max = Math.max(
                    ...data.pipelineStatus.map((x) => x.count),
                    1
                  );
                  const pct = Math.round((p.count / max) * 100);

                  return (
                    <div key={i} className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#6E4B2C] font-semibold">
                          {p.stage}
                        </span>
                        <span className="text-[#B87B4B]">{p.count}</span>
                      </div>
                      <div className="h-3 rounded-full bg-[#E9E2D5] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: theme.cinnamon,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Top Jobs */}
              <div
                className="rounded-3xl p-6"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: `1px solid ${theme.sand}`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold text-[#6E4B2C]">Top Jobs</h3>
                </div>

                {data.topJobs.length ? (
                  data.topJobs.map((job, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 rounded-xl mb-2"
                      style={{ background: theme.cream }}
                    >
                      <span className="font-semibold text-[#6E4B2C]">
                        {job.title}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-[#E9E2D5] text-[#6E4B2C] font-bold">
                        {job.applications}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#6E4B2C]/60">No job data yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
