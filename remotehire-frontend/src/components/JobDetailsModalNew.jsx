import React from "react";
import WorkIcon from "@mui/icons-material/Work";
import CloseIcon from "@mui/icons-material/Close";
// icons: Work (job avatar), Close (modal actions)

const JobDetailsModalNew = ({ job, isOpen, onClose, onApply, isApplied }) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(10, 11, 13, 0.6)" }}
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "rgba(236, 229, 216, 0.86)",
            color: "#2b2b2b",
            backdropFilter: "blur(6px) saturate(120%)",
            border: "1px solid rgba(160,140,120,0.12)",
          }}
        >
          <div
            className="flex items-start justify-between gap-4 px-8 py-6 border-b"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(178,114,77,0.95), rgba(165,185,163,0.95))",
                }}
              >
                <WorkIcon style={{ fontSize: 28, color: "#fff" }} />
              </div>

              <div>
                <p className="text-sm mt-1" style={{ color: "#5c4b3a" }}>
                  {job.posted_by || "Recruiter"} ·{" "}
                  <span className="font-medium">
                    {job.location || "Remote"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-sm" style={{ color: "#5c4b3a" }}>
                <div>{job.employment_type || "Full-time"}</div>
                <div className="text-xs">Posted {job.posted_date || "—"}</div>
              </div>
              <button
                onClick={onClose}
                className="btn-ghost p-2 rounded-lg hover:scale-105"
                aria-label="Close modal"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>
          </div>

          <div className="max-h-[72vh] overflow-y-auto">
            <div className="p-6 md:p-8 md:grid md:grid-cols-3 md:gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      background: "rgba(183,127,82,0.18)",
                      color: "#3b2b16",
                    }}
                  >
                    🟢 {job.status || "Active"}
                  </span>
                  {job.level && (
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        background: "rgba(0,0,0,0.05)",
                        color: "#5c4b3a",
                      }}
                    >
                      {job.level}
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: "#2b2b2b" }}
                  >
                    Job Description
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#4b3b2b" }}
                  >
                    {job.description || "No description provided"}
                  </p>
                </div>

                <div>
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{ color: "#2b2b2b" }}
                  >
                    Requirements
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {job.requirements?.required_experience_years > 0 && (
                      <div
                        className="p-4 rounded-xl bg-surface-50 border"
                        style={{ borderColor: "var(--border-color)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-xs text-muted">Experience</div>
                            <div className="font-semibold">
                              {job.requirements.required_experience_years}+
                              years
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {job.requirements?.required_education && (
                      <div
                        className="p-4 rounded-xl bg-surface-50 border"
                        style={{ borderColor: "var(--border-color)" }}
                      >
                        <div className="text-xs text-muted">Education</div>
                        <div className="font-semibold">
                          {job.requirements.required_education}
                        </div>
                      </div>
                    )}
                  </div>

                  {job.requirements?.required_skills?.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm text-muted mb-2">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.required_skills.map((s, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-md text-xs font-medium"
                            style={{
                              background: "rgba(183,127,82,0.18)",
                              color: "#3b2b16",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="pt-4 border-t"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <p className="text-xs font-mono" style={{ color: "#5c4b3a" }}>
                    Job ID: {job.id}
                  </p>
                </div>
              </div>

              <aside className="md:col-span-1 space-y-4">
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onApply(job.id);
                      onClose();
                    }}
                    disabled={isApplied}
                    className={`w-full py-3 rounded-xl font-semibold transition-transform transform hover:scale-102 ${
                      isApplied
                        ? "btn-ghost opacity-60 cursor-not-allowed"
                        : "btn-primary"
                    }`}
                  >
                    {isApplied ? "✅ Already Applied" : "🚀 Apply Now"}
                  </button>
                </div>
              </aside>
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 md:hidden">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn-ghost flex-1 py-3 rounded-xl"
                aria-label="Close modal"
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
              <button
                onClick={() => {
                  onApply(job.id);
                  onClose();
                }}
                disabled={isApplied}
                className={`btn-primary flex-1 py-3 rounded-xl ${
                  isApplied ? "opacity-50" : ""
                }`}
              >
                {isApplied ? "✅ Applied" : "🚀 Apply"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModalNew;
