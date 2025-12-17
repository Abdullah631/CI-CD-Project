import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import SearchIcon from "@mui/icons-material/Search";
// icons: small chart and search icons for list and stats
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
export default function RecruiterInterviewsPage() {
  const token = localStorage.getItem("token");

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("upcoming");

  const [currentTime, setCurrentTime] = useState(Date.now());
  const notifiedRef = useRef(new Set());

  /* ================= CLOCK ================= */
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ================= FETCH ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/interviews/recruiter/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setInterviews(res.data || []);
        setError("");
      } catch (e) {
        setError("Failed to load interviews");
      } finally {
        setLoading(false);
      }
    };

    load();
    const poll = setInterval(load, 30000);
    return () => clearInterval(poll);
  }, []);

  /* ================= NOTIFICATIONS ================= */
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;

    interviews.forEach((iv) => {
      const diff = new Date(iv.scheduled_at).getTime() - currentTime;
      const mins = Math.floor(diff / 60000);

      if ((mins === 5 || mins === 0) && diff > 0) {
        const key = `${iv.id}-${mins}`;
        if (!notifiedRef.current.has(key)) {
          notifiedRef.current.add(key);
          new Notification(
            mins === 5 ? "Interview soon" : "Interview starting",
            {
              body: `${iv.candidate_name} interview ${
                mins === 5 ? "in 5 minutes" : "is starting now"
              }`,
            }
          );
        }
      }
    });
  }, [interviews, currentTime]);

  /* ================= HELPERS ================= */
  const countdown = (time) => {
    const diff = new Date(time).getTime() - currentTime;
    if (diff <= 0) return "Started";
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}m ${s}s`;
  };

  const filtered = interviews
    .filter((iv) => {
      const s = search.toLowerCase();
      const match =
        iv.candidate_name?.toLowerCase().includes(s) ||
        iv.job_title?.toLowerCase().includes(s);
      const statusOk = filter === "all" || iv.status === filter;
      return match && statusOk;
    })
    .sort((a, b) => {
      const at = new Date(a.scheduled_at).getTime();
      const bt = new Date(b.scheduled_at).getTime();
      return sortOrder === "upcoming" ? at - bt : bt - at;
    });

  /* ================= STATS ================= */
  const stats = [
    {
      label: "Scheduled",
      value: interviews.filter((i) => i.status === "Scheduled").length,
    },
    {
      label: "Completed",
      value: interviews.filter((i) => i.status === "Completed").length,
    },
    { label: "Total", value: interviews.length },
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
      <RecruiterNav currentPage="interviews" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* ================= STATS ================= */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-3xl p-6 backdrop-blur-md"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: `1px solid ${theme.sand}`,
              }}
            >
              <div className="mb-3">
                <InsertChartIcon
                  style={{ fontSize: 28, color: theme.cinnamon }}
                />
              </div>
              <p className="text-sm font-semibold text-[#6E4B2C]/70">
                {s.label}
              </p>
              <p className="text-4xl font-bold text-[#6E4B2C]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ================= SEARCH & FILTER ================= */}
        <div
          className="rounded-3xl p-6 mb-10 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.75)",
            border: `1px solid ${theme.sand}`,
          }}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E4B2C]">
                <SearchIcon style={{ fontSize: 18 }} />
              </div>
              <input
                placeholder="Search interviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 py-3 rounded-xl border"
                style={{
                  background: theme.cream,
                  borderColor: theme.sand,
                  color: theme.clay,
                }}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="py-3 px-4 rounded-xl border"
              style={{
                background: theme.cream,
                borderColor: theme.sand,
                color: theme.clay,
              }}
            >
              <option value="all">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="py-3 px-4 rounded-xl border"
              style={{
                background: theme.cream,
                borderColor: theme.sand,
                color: theme.clay,
              }}
            >
              <option value="upcoming">Soonest</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {/* ================= LIST ================= */}
        {loading ? (
          <p className="text-center text-[#6E4B2C]">Loading interviews…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[#6E4B2C]/70">No interviews found</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((iv) => {
              const sched = new Date(iv.scheduled_at).getTime();
              const passed = currentTime - sched > 10 * 60 * 1000; // passed if >10 minutes after scheduled time
              const statusLabel = passed ? "Passed" : iv.status;

              return (
                <div
                  key={iv.id}
                  className="rounded-3xl p-6 backdrop-blur-md hover:shadow-xl transition"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: `1px solid ${theme.sand}`,
                  }}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#6E4B2C]">
                        {iv.candidate_name}
                      </h3>
                      <p className="text-sm text-[#6E4B2C]/70 mt-1">
                        {iv.job_title}
                      </p>
                      <p className="text-sm mt-1 text-[#B87B4B]">
                        {new Date(iv.scheduled_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="px-4 py-1 rounded-full text-sm font-semibold"
                        style={{
                          background: passed
                            ? "#d1d5db"
                            : iv.status === "Scheduled"
                            ? theme.cinnamon
                            : theme.sand,
                          color: passed ? theme.clay : theme.cream,
                        }}
                      >
                        {statusLabel}
                      </span>

                      <span className="text-sm text-[#6E4B2C]/70">
                        ⏱ {passed ? "Passed" : countdown(iv.scheduled_at)}
                      </span>

                      {!passed && (
                        <a
                          href={`/#/interview-room?id=${iv.id}`}
                          className="px-4 py-2 rounded-xl font-semibold"
                          style={{
                            background: theme.cinnamon,
                            color: theme.cream,
                          }}
                        >
                          Join
                        </a>
                      )}

                      <button
                        className="px-3 py-2 rounded-xl"
                        style={{
                          background: theme.sand,
                          color: theme.clay,
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
