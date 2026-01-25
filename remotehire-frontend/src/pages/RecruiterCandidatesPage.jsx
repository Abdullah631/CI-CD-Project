import React, { useState, useEffect } from "react";
import axios from "axios";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import SearchIcon from "@mui/icons-material/Search";
// icons: small chart for stats and search icon for inputs
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
export default function RecruiterCandidatesPage({ darkMode }) {
  const token = localStorage.getItem("token");

  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    candidate_id: null,
    job_id: null,
    scheduled_at: "",
  });
  const [scheduling, setScheduling] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH ================= */

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

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/recruiter/applicants/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(res.data || []);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER & SORT ================= */
  useEffect(() => {
    let data = [...candidates];

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.candidate_name?.toLowerCase().includes(s) ||
          c.candidate_email?.toLowerCase().includes(s) ||
          c.job_title?.toLowerCase().includes(s)
      );
    }

    data.sort((a, b) => {
      if (sortBy === "name")
        return (a.candidate_name || "").localeCompare(b.candidate_name || "");
      if (sortBy === "latest")
        return new Date(b.applied_at) - new Date(a.applied_at);
      return 0;
    });

    setFiltered(data);
  }, [candidates, search, sortBy]);

  /* ================= SCHEDULE ================= */
  const openSchedule = (c) => {
    setScheduleForm({
      candidate_id: c.candidate_id,
      job_id: c.job_id,
      scheduled_at: "",
    });
    setMessage("");
    setScheduleOpen(true);
  };

  const submitSchedule = async () => {
    if (!scheduleForm.scheduled_at) {
      setMessage("Select date & time");
      return;
    }
    try {
      setScheduling(true);
      await axios.post(
        `${API_BASE_URL}/api/interviews/schedule/`,
        {
          ...scheduleForm,
          scheduled_at: new Date(scheduleForm.scheduled_at).toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScheduleOpen(false);
    } catch {
      setMessage("Failed to schedule interview");
    } finally {
      setScheduling(false);
    }
  };

  /* ================= STATS ================= */
  const stats = [
    {
      label: "Total Applicants",
      value: candidates.length,
    },
    {
      label: "Jobs Applied",
      value: [...new Set(candidates.map((c) => c.job_id))].length,
    },
    {
      label: "Unique Candidates",
      value: [...new Set(candidates.map((c) => c.candidate_id))].length,
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
      <RecruiterNav currentPage="candidates" />

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
                boxShadow: "0 10px 30px rgba(110,75,44,0.1)",
              }}
            >
              <div className="mb-3">
                <InsertChartIcon
                  style={{ fontSize: 28, color: theme.cinnamon }}
                />
              </div>
              <p className="text-sm font-semibold text-opacity-70 text-[#6E4B2C]">
                {s.label}
              </p>
              <p className="text-4xl font-bold text-[#6E4B2C]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ================= SEARCH ================= */}
        <div
          className="rounded-3xl p-6 mb-10 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.75)",
            border: `1px solid ${theme.sand}`,
          }}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E4B2C]">
                <SearchIcon style={{ fontSize: 18 }} />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates..."
                className="w-full pl-12 py-3 rounded-xl border outline-none"
                style={{
                  background: theme.cream,
                  borderColor: theme.sand,
                  color: theme.clay,
                }}
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border appearance-none"
                style={{
                  background: theme.cream,
                  borderColor: theme.sand,
                  color: theme.clay,
                }}
              >
                <option value="name">Sort by Name</option>
                <option value="latest">Latest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= LIST ================= */}
        {loading ? (
          <p className="text-center text-[#6E4B2C]">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[#6E4B2C]/70">No candidates found</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <div
                key={c.application_id}
                className="rounded-3xl p-6 backdrop-blur-md hover:shadow-xl transition"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: `1px solid ${theme.sand}`,
                }}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[#6E4B2C]">
                      {c.candidate_name}
                    </h3>
                    <p className="text-sm text-[#6E4B2C]/70 mt-1">
                      {c.candidate_email}
                    </p>
                    <p className="text-sm font-semibold text-[#B87B4B] mt-1">
                      {c.job_title}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <a
                      href={`#/candidate/${c.candidate_id}`}
                      className="px-4 py-2 rounded-xl font-semibold"
                      style={{
                        background: theme.cinnamon,
                        color: theme.cream,
                      }}
                    >
                      View
                    </a>

                    <button
                      onClick={() => openSchedule(c)}
                      className="px-4 py-2 rounded-xl font-semibold"
                      style={{
                        background: theme.sand,
                        color: theme.clay,
                      }}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= SCHEDULE MODAL ================= */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setScheduleOpen(false)}
          />
          <div
            className="relative rounded-3xl p-6 w-full max-w-md"
            style={{
              background: theme.cream,
              border: `1px solid ${theme.sand}`,
            }}
          >
            <h2 className="text-xl font-bold text-[#6E4B2C] mb-4">
              Schedule Interview
            </h2>

            <input
              type="datetime-local"
              value={scheduleForm.scheduled_at}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  scheduled_at: e.target.value,
                })
              }
              className="w-full px-4 py-2 rounded-xl border mb-3"
              style={{
                background: theme.cream,
                borderColor: theme.sand,
                color: theme.clay,
              }}
            />

            {message && <p className="text-sm text-red-600 mb-2">{message}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setScheduleOpen(false)}
                className="px-4 py-2 rounded-xl"
                style={{ color: theme.clay }}
              >
                Cancel
              </button>
              <button
                disabled={scheduling}
                onClick={submitSchedule}
                className="px-4 py-2 rounded-xl font-semibold"
                style={{
                  background: theme.cinnamon,
                  color: theme.cream,
                }}
              >
                {scheduling ? "Scheduling…" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
