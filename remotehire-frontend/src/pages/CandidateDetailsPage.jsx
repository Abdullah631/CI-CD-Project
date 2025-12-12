import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Code,
  Award,
  BookOpen,
  Download,
  ArrowLeft,
} from "lucide-react";

export const CandidateDetailsPage = () => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const token = localStorage.getItem("token");

  const candidateIdMatch = window.location.hash.match(/\/candidate\/(\d+)/);
  const candidateId = candidateIdMatch ? candidateIdMatch[1] : null;

  useEffect(() => {
    if (!candidateId) {
      setError("Invalid candidate ID");
      setLoading(false);
      return;
    }
    fetchCandidateDetails();
  }, [candidateId]);

  const fetchCandidateDetails = async () => {
    try {
      const response = await axios.get(
        `${window.API_BASE_URL}/api/candidate/${candidateId}/cv-metadata/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCandidate(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching candidate:", err);
      setError("Failed to load candidate details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800"
            : "bg-gradient-to-br from-blue-50 to-indigo-50"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-16 w-16 border-4 border-transparent ${
            darkMode ? "border-t-indigo-500" : "border-t-blue-600"
          }`}
        ></div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800"
            : "bg-gradient-to-br from-blue-50 to-indigo-50"
        }`}
      >
        <div
          className={`rounded-2xl border backdrop-blur p-8 text-center ${
            darkMode
              ? "bg-red-500/10 border-red-500/30"
              : "bg-red-50/80 border-red-200"
          }`}
        >
          <p
            className={`text-lg font-semibold ${
              darkMode ? "text-red-300" : "text-red-700"
            }`}
          >
            {error || "Candidate not found"}
          </p>
        </div>
      </div>
    );
  }

  const metadata = candidate.cv_metadata || {};

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-all duration-300 ${
          darkMode
            ? "bg-slate-800/80 border-slate-700/50"
            : "bg-white/80 border-blue-100/50"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
              darkMode
                ? "text-slate-300 hover:bg-slate-700/50"
                : "text-slate-700 hover:bg-blue-100"
            }`}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <button
            onClick={() => {
              setDarkMode(!darkMode);
              localStorage.setItem("darkMode", !darkMode);
            }}
            className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
              darkMode
                ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Candidate Header */}
        <div
          className={`rounded-3xl border backdrop-blur transition-all duration-300 overflow-hidden mb-8 ${
            darkMode
              ? "bg-slate-800/40 border-slate-700/50 shadow-xl shadow-black/20"
              : "bg-white/60 border-blue-100/50 shadow-lg shadow-blue-500/5"
          }`}
        >
          <div
            className={`px-8 py-12 border-b transition-all duration-300 ${
              darkMode
                ? "bg-indigo-600/10 border-slate-700/50"
                : "bg-blue-600/5 border-blue-100/50"
            }`}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1
                  className={`text-4xl font-bold mb-2 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {candidate.candidate_name}
                </h1>
                <p
                  className={`text-lg flex items-center gap-2 mb-2 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  <Mail size={18} />
                  {candidate.candidate_email}
                </p>
                {candidate.candidate_phone && (
                  <p
                    className={`text-lg flex items-center gap-2 ${
                      darkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    <Phone size={18} />
                    {candidate.candidate_phone}
                  </p>
                )}
              </div>
              {candidate.cv_url && (
                <a
                  href={candidate.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    darkMode
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 border border-blue-300/50"
                  }`}
                >
                  <Download size={20} />
                  Download CV
                </a>
              )}
            </div>
          </div>

          {/* Professional Profile */}
          {Object.keys(metadata).length > 0 && !metadata.error && (
            <div className="p-8 space-y-8">
              {/* Key Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metadata.current_title && (
                  <div
                    className={`p-4 rounded-xl transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-700/30 border border-slate-600/50"
                        : "bg-blue-50/50 border border-blue-100/50"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-2 ${
                        darkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      <Briefcase size={14} />
                      Current Title
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {metadata.current_title}
                    </p>
                  </div>
                )}

                {metadata.years_of_experience !== undefined && (
                  <div
                    className={`p-4 rounded-xl transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-700/30 border border-slate-600/50"
                        : "bg-blue-50/50 border border-blue-100/50"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-2 ${
                        darkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      <Briefcase size={14} />
                      Experience
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {metadata.years_of_experience}+ years
                    </p>
                  </div>
                )}

                {metadata.email && (
                  <div
                    className={`p-4 rounded-xl transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-700/30 border border-slate-600/50"
                        : "bg-blue-50/50 border border-blue-100/50"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-2 ${
                        darkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      <Mail size={14} />
                      Email
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {metadata.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {metadata.skills && metadata.skills.length > 0 && (
                <div>
                  <h3
                    className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    <Code
                      size={24}
                      className={darkMode ? "text-blue-400" : "text-blue-600"}
                    />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {metadata.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                          darkMode
                            ? "bg-blue-600/30 text-blue-300 border border-blue-500/50"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Programming Languages */}
              {metadata.programming_languages &&
                metadata.programming_languages.length > 0 && (
                  <div>
                    <h3
                      className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Code
                        size={24}
                        className={
                          darkMode ? "text-purple-400" : "text-purple-600"
                        }
                      />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {metadata.programming_languages.map((lang, idx) => (
                        <span
                          key={idx}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                            darkMode
                              ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                              : "bg-purple-100 text-purple-800 border border-purple-200"
                          }`}
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Education */}
              {metadata.education && metadata.education.length > 0 && (
                <div>
                  <h3
                    className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    <BookOpen
                      size={24}
                      className={
                        darkMode ? "text-indigo-400" : "text-indigo-600"
                      }
                    />
                    Education
                  </h3>
                  <div className="space-y-3">
                    {metadata.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className={`p-5 rounded-xl border transition-all duration-300 hover:scale-102 ${
                          darkMode
                            ? "bg-slate-700/30 border-slate-600/50"
                            : "bg-indigo-50/50 border-indigo-100/50"
                        }`}
                      >
                        <p
                          className={`font-bold text-lg ${
                            darkMode ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {edu.degree}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            darkMode ? "text-indigo-300" : "text-indigo-600"
                          }`}
                        >
                          {edu.field}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {edu.institution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {metadata.work_experience &&
                metadata.work_experience.length > 0 && (
                  <div>
                    <h3
                      className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Briefcase
                        size={24}
                        className={
                          darkMode ? "text-green-400" : "text-green-600"
                        }
                      />
                      Work Experience
                    </h3>
                    <div className="space-y-3">
                      {metadata.work_experience.map((exp, idx) => (
                        <div
                          key={idx}
                          className={`p-5 rounded-xl border transition-all duration-300 hover:scale-102 ${
                            darkMode
                              ? "bg-slate-700/30 border-slate-600/50"
                              : "bg-green-50/50 border-green-100/50"
                          }`}
                        >
                          <p
                            className={`font-bold text-lg ${
                              darkMode ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {exp.title}
                          </p>
                          <p
                            className={`text-sm font-semibold ${
                              darkMode ? "text-green-300" : "text-green-600"
                            }`}
                          >
                            {exp.company}
                          </p>
                          {exp.years && (
                            <p
                              className={`text-sm ${
                                darkMode ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              {exp.years} years
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Certifications */}
              {metadata.certifications &&
                metadata.certifications.length > 0 && (
                  <div>
                    <h3
                      className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Award
                        size={24}
                        className={
                          darkMode ? "text-yellow-400" : "text-yellow-600"
                        }
                      />
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {metadata.certifications.map((cert, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                            darkMode
                              ? "hover:bg-slate-700/30"
                              : "hover:bg-yellow-50/50"
                          }`}
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              darkMode ? "bg-yellow-400" : "bg-yellow-600"
                            }`}
                          ></span>
                          <span
                            className={`font-medium ${
                              darkMode ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            {cert}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CandidateDetailsPage;
