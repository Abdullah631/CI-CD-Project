import React, { useEffect, useState } from "react";
import axios from "axios";
// icons removed to simplify UI; keep only logo
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

export default function CandidateDetailsPage() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  const token = localStorage.getItem("token");
  const match = window.location.hash.match(/\/candidate\/(\d+)/);
  const candidateId = match ? match[1] : null;

  /* ================= USER ================= */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUserName(JSON.parse(u)?.username || "User");
  }, []);

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
    if (!candidateId) {
      setError("Invalid candidate ID");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/candidate/${candidateId}/cv-metadata/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCandidate(res.data || {});
      } catch {
        setError("Failed to load candidate details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [candidateId]);

  const metadata = candidate?.cv_metadata || {};

  /* ================= ACTIONS ================= */
  const openCV = async (type) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/candidate/${candidateId}/cv/${type}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.open(
        res.data?.view_url || res.data?.download_url || candidate.cv_url
      );
    } catch {
      candidate?.cv_url && window.open(candidate.cv_url);
    }
  };

  /* ================= STATES ================= */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.cinnamon }}
        />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );

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
      <CandidateNav userName={userName} currentPage="details" />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* ================= HEADER ================= */}
        <div
          className="rounded-3xl p-8 mb-8"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: `1px solid ${theme.sand}`,
          }}
        >
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-[#6E4B2C]">
                {candidate.candidate_name}
              </h1>

              <div className="mt-3 space-y-1 text-[#6E4B2C]/70">
                <p>{candidate.candidate_email}</p>
                {candidate.candidate_phone && (
                  <p>{candidate.candidate_phone}</p>
                )}
              </div>
            </div>

            {candidate.cv_url && (
              <div className="flex gap-3">
                <button
                  onClick={() => openCV("view")}
                  className="px-4 py-2 rounded-xl font-semibold"
                  style={{ background: theme.cinnamon, color: theme.cream }}
                >
                  View CV
                </button>
                <button
                  onClick={() => openCV("download")}
                  className="px-4 py-2 rounded-xl font-semibold"
                  style={{ background: theme.sand, color: theme.clay }}
                >
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= SECTIONS ================= */}
        <div className="space-y-10">
          {/* SKILLS */}
          {metadata.skills?.length > 0 && (
            <Section title="Skills">
              {metadata.skills.map((s, i) => (
                <Tag key={i}>{s}</Tag>
              ))}
            </Section>
          )}

          {/* LANGUAGES */}
          {metadata.programming_languages?.length > 0 && (
            <Section title="Programming Languages">
              {metadata.programming_languages.map((l, i) => (
                <Tag key={i}>{l}</Tag>
              ))}
            </Section>
          )}

          {/* EDUCATION */}
          {metadata.education?.length > 0 && (
            <Section title="Education">
              <div className="space-y-3">
                {metadata.education.map((e, i) => (
                  <Card key={i}>
                    <p className="font-semibold">{e.degree}</p>
                    <p className="text-sm opacity-70">{e.institution}</p>
                    <p className="text-sm opacity-60">{e.year}</p>
                  </Card>
                ))}
              </div>
            </Section>
          )}

          {/* EXPERIENCE */}
          {metadata.work_experience?.length > 0 && (
            <Section title="Work Experience">
              <div className="space-y-3">
                {metadata.work_experience.map((e, i) => (
                  <Card key={i}>
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-sm text-[#6E4B2C]/70">{e.company}</p>
                    {e.years && (
                      <p className="text-sm opacity-60">{e.years} years</p>
                    )}
                  </Card>
                ))}
              </div>
            </Section>
          )}

          {/* CERTIFICATIONS */}
          {metadata.certifications?.length > 0 && (
            <Section title="Certifications">
              {metadata.certifications.map((c, i) => (
                <Tag key={i}>{c}</Tag>
              ))}
            </Section>
          )}
        </div>
      </main>
    </div>
  );
}

/* ================= UI HELPERS ================= */

const Section = ({ title, children }) => (
  <section>
    <h3 className="text-xl font-bold text-[#6E4B2C] mb-4">{title}</h3>
    <div className="flex flex-wrap gap-3">{children}</div>
  </section>
);

const Tag = ({ children }) => (
  <span
    className="px-4 py-2 rounded-xl text-sm font-semibold"
    style={{ background: "#EFE7DA", color: "#6E4B2C" }}
  >
    {children}
  </span>
);

const Card = ({ children }) => (
  <div
    className="p-4 rounded-2xl"
    style={{ background: "#F8F4EC", border: "1px solid #E3D7C7" }}
  >
    {children}
  </div>
);
