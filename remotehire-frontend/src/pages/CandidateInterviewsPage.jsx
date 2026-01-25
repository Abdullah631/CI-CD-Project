import React, { useEffect, useState } from "react";
import axios from "axios";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
// icons: calendar for interview cards
import CandidateNav from "../components/CandidateNav";
import dashImg from "../assets/dash.jpg";
import { API_BASE_URL } from "../config";
// single import of CandidateNav

/* ================= THEME ================= */
const theme = {
  sage: "#B7C7B1",
  cinnamon: "#B87B4B",
  cream: "#FBF6E6",
  clay: "#6E4B2C",
  border: "#E3D7C7",
};

export default function CandidateInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("upcoming");

  const token = localStorage.getItem("token");

  /* ================= USER ================= */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) return (window.location.href = "/#/signin");
    setUserName(JSON.parse(u).username || "User");
  }, []);

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/interviews/candidate/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInterviews(res.data || []);
      } catch {
        setError("Failed to load interviews");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  /* ================= TIMER ================= */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ================= HELPERS ================= */
  const interviewState = (time) => {
    const diff = new Date(time).getTime() - now;
    const passed = now - new Date(time).getTime();
    if (diff > 5 * 60 * 1000) return "Scheduled";
    if (diff <= 5 * 60 * 1000 && passed <= 10 * 60 * 1000)
      return "Join Interview";
    return "Passed";
  };

  const countdown = (time) => {
    const d = new Date(time).getTime() - now;
    if (d <= 0) return "Started";
    const m = Math.floor((d / 1000 / 60) % 60);
    const h = Math.floor(d / 1000 / 60 / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const respondToInterview = async (id, action) => {
    try {
      // optimistic update
      setInterviews((prev) =>
        prev.map((it) => (it.id === id ? { ...it, _updating: true } : it))
      );
      const res = await axios.post(
        `${API_BASE_URL}/api/interviews/${id}/response/`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data.interview;
      setInterviews((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, ...updated, _updating: false } : it
        )
      );
    } catch (err) {
      console.error("Error responding to interview:", err);
      setInterviews((prev) =>
        prev.map((it) => (it.id === id ? { ...it, _updating: false } : it))
      );
      alert("Failed to respond. Please try again.");
    }
  };

  const filtered = interviews
    .filter((i) => {
      if (filter === "current")
        return new Date(i.scheduled_at).getTime() >= now;
      if (filter === "passed") return new Date(i.scheduled_at).getTime() < now;
      return true;
    })
    .filter((i) => {
      const q = search.toLowerCase();
      return (
        (i.recruiter_name || "").toLowerCase().includes(q) ||
        (i.title || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      sort === "upcoming"
        ? new Date(a.scheduled_at) - new Date(b.scheduled_at)
        : new Date(b.scheduled_at) - new Date(a.scheduled_at)
    );

  const stats = {
    total: interviews.length,
    passed: interviews.filter((i) => new Date(i.scheduled_at).getTime() < now)
      .length,
  };

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
      <CandidateNav userName={userName} currentPage="interviews" />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* ================= HEADER ================= */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#6E4B2C]">My Interviews</h1>
          <p className="text-[#6E4B2C]/70">
            Track upcoming and completed interviews
          </p>
        </header>

        {/* ================= CONTROLS ================= */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-[240px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search interviews..."
              className="w-full pl-10 py-2 rounded-xl border bg-white/80"
              style={{ borderColor: theme.border }}
            />
          </div>

          {["all", "current", "passed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-full font-semibold text-sm"
              style={{
                background: filter === f ? theme.cinnamon : "white",
                color: filter === f ? theme.cream : theme.clay,
                border: `1px solid ${theme.border}`,
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl border bg-white/80"
            style={{ borderColor: theme.border }}
          >
            <option value="upcoming">Soonest</option>
            <option value="recent">Most recent</option>
          </select>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <Stat label="Total" value={stats.total} />
          <Stat label="Passed" value={stats.passed} />
          <Stat label="Upcoming" value={stats.total - stats.passed} />
        </div>

        {/* ================= CONTENT ================= */}
        {loading ? (
          <Loader />
        ) : error ? (
          <Alert color="#dc2626">{error}</Alert>
        ) : filtered.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((i) => {
              const state = interviewState(i.scheduled_at);
              return (
                <div
                  key={i.id}
                  className="p-6 rounded-3xl bg-white/85 border hover:shadow-lg transition"
                  style={{ borderColor: theme.border }}
                >
                  <div className="flex gap-4">
                    <div
                      className="p-3 rounded-xl flex items-center justify-center"
                      style={{ background: theme.cinnamon }}
                    >
                      <CalendarTodayIcon
                        style={{ fontSize: 20, color: "#fff" }}
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#6E4B2C]">
                        {i.recruiter_name}
                      </h3>
                      <p className="text-sm text-[#6E4B2C]/70">
                        {i.job?.title || i.title}
                      </p>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-[#6E4B2C]/70">
                          {countdown(i.scheduled_at)}
                        </span>

                        {state === "Join Interview" ? (
                          i.status === "accepted" ? (
                            <button
                              onClick={() =>
                                (window.location.hash = `/interview-room?id=${i.id}`)
                              }
                              className="px-4 py-2 rounded-xl font-semibold"
                              style={{
                                background: theme.cinnamon,
                                color: theme.cream,
                              }}
                            >
                              Join
                            </button>
                          ) : i.status === "declined" ? (
                            <span
                              className="px-4 py-2 rounded-xl text-sm font-semibold"
                              style={{
                                background: "#FFEDEE",
                                color: "#B91C1C",
                              }}
                            >
                              Declined
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={async () =>
                                  await respondToInterview(i.id, "accept")
                                }
                                className="px-4 py-2 rounded-xl font-semibold"
                                style={{
                                  background: theme.cinnamon,
                                  color: theme.cream,
                                }}
                                disabled={i._updating}
                              >
                                {i._updating ? "Accepting…" : "Accept"}
                              </button>
                              <button
                                onClick={async () =>
                                  await respondToInterview(i.id, "decline")
                                }
                                className="px-4 py-2 rounded-xl font-semibold"
                                style={{
                                  background: "#F3F4F6",
                                  color: theme.clay,
                                }}
                                disabled={i._updating}
                              >
                                {i._updating ? "Declining…" : "Decline"}
                              </button>
                            </div>
                          )
                        ) : (
                          <span
                            className="px-4 py-2 rounded-xl text-sm font-semibold"
                            style={{
                              background:
                                state === "Passed" ? "#EDE7DB" : "#F7F2EA",
                              color: theme.clay,
                            }}
                          >
                            {state}
                          </span>
                        )}
                      </div>
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

/* ================= UI PARTS ================= */

const Stat = ({ label, value }) => (
  <div className="p-5 rounded-2xl bg-white/80 border text-center">
    <p className="text-sm text-[#6E4B2C]/70">{label}</p>
    <p className="text-3xl font-bold text-[#6E4B2C]">{value}</p>
  </div>
);

const Loader = () => (
  <div className="flex justify-center py-16">
    <div
      className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: theme.cinnamon }}
    />
  </div>
);

const Alert = ({ children, color }) => (
  <div
    className="p-4 rounded-xl font-semibold"
    style={{ background: `${color}15`, color }}
  >
    {children}
  </div>
);

const Empty = () => (
  <div className="text-center py-20">
    <p className="text-lg font-semibold text-[#6E4B2C] mb-2">
      No interviews scheduled
    </p>
    <p className="text-[#6E4B2C]/70">
      You’ll see interviews here once recruiters schedule them
    </p>
  </div>
);
