import React, { useEffect, useState } from "react";
import axios from "axios";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import DescriptionIcon from "@mui/icons-material/Description";
import WorkIcon from "@mui/icons-material/Work";
import CodeIcon from "@mui/icons-material/Code";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CandidateNav from "../components/CandidateNav";
import dashImg from "../assets/dash.jpg";
import { API_BASE_URL } from "../config";

export default function ProfilePage() {
  const token = localStorage.getItem("token");

  const [userName, setUserName] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------------- User ---------------- */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUserName(JSON.parse(stored).username || "User");
      } catch {}
    }
  }, []);

  /* ---------------- Profile ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/candidate/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axios.put(
        `${API_BASE_URL}/api/candidate/profile/`,
        {
          full_name: profile.full_name,
          phone_number: profile.phone_number,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setEditing(false);
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const uploadCV = async (e) => {
    e.preventDefault();
    if (!cvFile) return;
    try {
      setUploading(true);
      const form = new FormData();
      form.append("cv", cvFile);

      const res = await axios.post(
        `${API_BASE_URL}/api/candidate/upload-cv/`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile((p) => ({
        ...p,
        cv: res.data.cv_url,
        cv_metadata: res.data.metadata,
        cv_last_updated: new Date().toISOString(),
      }));

      setCvFile(null);
      setSuccess("CV uploaded & analyzed");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to upload CV");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-14 h-14 rounded-full animate-spin border-4 border-transparent"
          style={{ borderTopColor: "var(--cinnamon)" }}
        />
      </div>
    );
  }

  if (!profile) return null;
  const m = profile.cv_metadata || {};

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg)",
        backgroundImage: `url(${dashImg})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <CandidateNav userName={userName} currentPage="profile" />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-2xl border bg-red-50 text-red-600 flex gap-2">
            <ErrorOutlineIcon style={{ fontSize: 18 }} />
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-2xl border bg-green-50 text-green-600 flex gap-2">
            <CheckCircleIcon style={{ fontSize: 18 }} />
            {success}
          </div>
        )}

        {/* ---------------- Personal Info ---------------- */}
        <div className="clay-card">
          <div className="px-6 py-5 border-b bg-[rgba(165,185,163,0.15)]">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <PersonIcon style={{ fontSize: 20 }} />
              Personal Information
            </h2>
          </div>

          <form
            onSubmit={saveProfile}
            className="p-6 grid md:grid-cols-2 gap-6"
          >
            <input
              disabled={!editing}
              value={profile.full_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
              placeholder="Full name"
              className="input"
            />
            <input
              disabled={!editing}
              value={profile.phone_number || ""}
              onChange={(e) =>
                setProfile({ ...profile, phone_number: e.target.value })
              }
              placeholder="Phone number"
              className="input"
            />
            <input
              disabled
              value={profile.email}
              className="input opacity-60"
            />
            <input
              disabled
              value={profile.username}
              className="input opacity-60"
            />

            <div className="md:col-span-2 flex gap-3">
              {!editing ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <button type="submit" className="btn-primary">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ---------------- CV Upload ---------------- */}
        <div className="clay-card">
          <div className="px-6 py-5 border-b bg-[rgba(178,114,77,0.12)]">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DescriptionIcon style={{ fontSize: 20 }} />
              CV Management
            </h2>
          </div>

          <form onSubmit={uploadCV} className="p-6 space-y-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setCvFile(e.target.files[0])}
            />
            <button disabled={!cvFile || uploading} className="btn-primary">
              {uploading ? "Processing..." : "Upload CV"}
            </button>
          </form>
        </div>

        {/* ---------------- Extracted CV Info ---------------- */}
        {Object.keys(m).length > 0 && (
          <div className="clay-card">
            <div className="px-6 py-5 border-b bg-[rgba(165,185,163,0.15)]">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MenuBookIcon style={{ fontSize: 20 }} />
                Extracted CV Information
              </h2>
            </div>

            <div className="p-6 space-y-8">
              {/* Summary cards */}
              <div className="grid sm:grid-cols-2 gap-6">
                {m.current_title && (
                  <div className="p-4 rounded-xl border bg-white">
                    <p className="text-xs uppercase mb-2 flex gap-2">
                      <WorkIcon style={{ fontSize: 14 }} /> Current Role
                    </p>
                    <p className="text-lg font-bold">{m.current_title}</p>
                  </div>
                )}
                {m.years_of_experience !== undefined && (
                  <div className="p-4 rounded-xl border bg-white">
                    <p className="text-xs uppercase mb-2 flex gap-2">
                      <CalendarTodayIcon style={{ fontSize: 14 }} /> Experience
                    </p>
                    <p className="text-lg font-bold">
                      {m.years_of_experience}+ years
                    </p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {Array.isArray(m.skills) && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <CodeIcon style={{ fontSize: 18 }} /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {m.skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-full text-sm font-semibold border"
                        style={{
                          background: "rgba(178,114,77,0.15)",
                          color: "var(--cinnamon)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {Array.isArray(m.education) && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <MenuBookIcon style={{ fontSize: 18 }} /> Education
                  </h3>
                  <div className="space-y-3">
                    {m.education.map((e, i) => (
                      <div key={i} className="p-4 rounded-xl border bg-white">
                        <p className="font-semibold">{e.degree}</p>
                        <p className="text-sm">{e.institution}</p>
                        {e.year && (
                          <p className="text-xs opacity-70">{e.year}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {Array.isArray(m.work_experience) && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <WorkIcon style={{ fontSize: 18 }} /> Work Experience
                  </h3>
                  <div className="space-y-3">
                    {m.work_experience.map((e, i) => (
                      <div key={i} className="p-4 rounded-xl border bg-white">
                        <p className="font-semibold">{e.title}</p>
                        <p className="text-sm">{e.company}</p>
                        {e.years && (
                          <p className="text-xs opacity-70">{e.years} years</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {Array.isArray(m.certifications) && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <EmojiEventsIcon style={{ fontSize: 18 }} /> Certifications
                  </h3>
                  <ul className="space-y-2">
                    {m.certifications.map((c, i) => (
                      <li key={i} className="flex gap-2 items-center">
                        <span className="w-2 h-2 rounded-full bg-[var(--cinnamon)]" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
