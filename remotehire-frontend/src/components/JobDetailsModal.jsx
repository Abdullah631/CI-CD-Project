import React from "react";
import { X, Briefcase, Users, Clock, BookOpen, Star } from "lucide-react";

export const JobDetailsModal = ({
  job,
  isOpen,
  onClose,
  darkMode,
  onApply,
  isApplied,
}) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className={`relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          darkMode
            ? "bg-gradient-to-b from-slate-800 to-slate-800/80 border border-slate-700/50"
            : "bg-gradient-to-b from-white to-blue-50/50 border border-blue-100/50"
        }`}
      >
        {/* Header */}
        <div
          className={`relative p-8 transition-all duration-300 ${
            darkMode
              ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-slate-700/50"
              : "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-blue-100/50"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div
                className={`p-4 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                  darkMode
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600"
                    : "bg-gradient-to-br from-blue-600 to-indigo-600"
                }`}
              >
                <Briefcase className="text-white" size={32} />
              </div>
              <div>
                <h2
                  className={`text-3xl md:text-4xl font-bold transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {job.title}
                </h2>
                <p
                  className={`text-sm md:text-base mt-2 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Posted by{" "}
                  <span className="font-semibold">
                    {job.posted_by || "Recruiter"}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                darkMode
                  ? "hover:bg-slate-700/50 text-slate-400 hover:text-white"
                  : "hover:bg-blue-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={`max-h-[70vh] overflow-y-auto ${
            darkMode ? "scrollbar-dark" : "scrollbar-light"
          }`}
        >
          <div className="p-8 space-y-8">
            {/* Status */}
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  darkMode
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-green-100/80 text-green-700 border border-green-200"
                }`}
              >
                🟢 {job.status || "Active"}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3
                className={`text-xl font-bold mb-3 flex items-center gap-2 ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                <BookOpen
                  size={20}
                  className={darkMode ? "text-indigo-400" : "text-blue-600"}
                />
                Job Description
              </h3>
              <p
                className={`text-base leading-relaxed ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {job.description || "No description provided"}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements && Object.keys(job.requirements).length > 0 && (
              <div>
                <h3
                  className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  <Star
                    size={20}
                    className={darkMode ? "text-indigo-400" : "text-blue-600"}
                  />
                  Job Requirements
                </h3>

                <div className="space-y-4">
                  {job.requirements.required_experience_years > 0 && (
                    <div
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        darkMode
                          ? "bg-slate-700/30 border border-slate-600/50"
                          : "bg-blue-50/50 border border-blue-100/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock
                          className={
                            darkMode ? "text-indigo-400" : "text-blue-600"
                          }
                          size={20}
                        />
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              darkMode ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            Experience Required
                          </p>
                          <p
                            className={`text-lg font-bold ${
                              darkMode ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {job.requirements.required_experience_years}+ years
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {job.requirements.required_education && (
                    <div
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        darkMode
                          ? "bg-slate-700/30 border border-slate-600/50"
                          : "bg-blue-50/50 border border-blue-100/50"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold mb-1 ${
                          darkMode ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        Education
                      </p>
                      <p
                        className={`text-base font-bold ${
                          darkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {job.requirements.required_education}
                      </p>
                    </div>
                  )}

                  {job.requirements.required_skills &&
                    job.requirements.required_skills.length > 0 && (
                      <div>
                        <p
                          className={`text-sm font-semibold mb-3 ${
                            darkMode ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          Required Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.required_skills.map(
                            (skill, idx) => (
                              <span
                                key={idx}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                                  darkMode
                                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50"
                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                }`}
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {job.requirements.required_languages &&
                    job.requirements.required_languages.length > 0 && (
                      <div>
                        <p
                          className={`text-sm font-semibold mb-3 ${
                            darkMode ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          Languages
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.required_languages.map(
                            (lang, idx) => (
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
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {job.requirements.required_certifications &&
                    job.requirements.required_certifications.length > 0 && (
                      <div>
                        <p
                          className={`text-sm font-semibold mb-3 ${
                            darkMode ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          Certifications
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.required_certifications.map(
                            (cert, idx) => (
                              <span
                                key={idx}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                                  darkMode
                                    ? "bg-green-600/30 text-green-300 border border-green-500/50"
                                    : "bg-green-100 text-green-800 border border-green-200"
                                }`}
                              >
                                {cert}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Job ID */}
            <div
              className={`pt-6 border-t transition-all duration-300 ${
                darkMode ? "border-slate-700/50" : "border-blue-100/50"
              }`}
            >
              <p
                className={`text-xs font-mono ${
                  darkMode ? "text-slate-500" : "text-slate-500"
                }`}
              >
                Job ID: {job.id}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex gap-4 p-8 border-t transition-all duration-300 ${
            darkMode
              ? "bg-slate-800/50 border-slate-700/50"
              : "bg-blue-50/50 border-blue-100/50"
          }`}
        >
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              darkMode
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600/50"
                : "bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-300"
            }`}
          >
            Close
          </button>
          <button
            onClick={() => {
              onApply(job.id);
              onClose();
            }}
            disabled={isApplied}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              isApplied
                ? darkMode
                  ? "bg-slate-700/30 text-slate-400 border border-slate-600/30"
                  : "bg-slate-200 text-slate-500 border border-slate-300"
                : darkMode
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50 border border-blue-300/50"
            }`}
          >
            {isApplied ? "✅ Already Applied" : "🚀 Apply Now"}
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-dark::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 4px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
        .scrollbar-light::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default JobDetailsModal;
