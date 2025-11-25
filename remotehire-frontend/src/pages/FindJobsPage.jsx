import React, { useState, useEffect } from "react";
import axios from "axios";

export const FindJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        // Use public jobs endpoint (not recruiter-only) so candidates can fetch jobs
        const res = await axios.get("http://127.0.0.1:8000/api/jobs/", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const allJobs = res.data || [];

        // Show only active jobs to candidates (case-insensitive)
        const activeJobs = allJobs.filter(
          (job) => (job.status || "").toLowerCase() === "active"
        );

        setJobs(activeJobs);
      } catch (err) {
        console.error(err);
        // Provide a bit more context for common failures
        if (err.response && err.response.status === 403) {
          setError("You do not have permission to view jobs. Please sign in as a candidate.");
        } else if (err.response && err.response.status === 404) {
          setError("Jobs API not found (404). Check backend routes.");
        } else {
          setError("Failed to load jobs");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Listen for updates from recruiter page and cross-tab storage
    const updateListener = () => fetchJobs();
    window.addEventListener("jobsUpdated", updateListener);
    const storageHandler = (e) => { if (e.key === 'jobs_updated') fetchJobs(); };
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener("jobsUpdated", updateListener);
      window.removeEventListener('storage', storageHandler);
    };
  }, [token]);

  const handleApply = async (jobId) => {
    setError("");
    setSuccess("");

    if (!token) {
      setError("You must be signed in as a candidate to apply.");
      return;
    }

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/jobs/${jobId}/apply/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data?.message || "Applied");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to apply");
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Find Jobs</h1>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 mb-4">{error}</div>}
        {success && <div className="p-3 bg-green-50 text-green-700 mb-4">{success}</div>}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {jobs.length === 0 && (
              <div className="text-sm text-gray-600">No active jobs available right now.</div>
            )}

            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-start">
                <div className="flex-1 pr-6">
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{job.description}</p>

                  <p className="text-xs text-gray-500 mt-2">
                    Posted by: {job.posted_by || "Recruiter"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-sm text-gray-600">{job.status}</div>
                  <button
                    onClick={() => handleApply(job.id)}
                    className="py-2 px-4 bg-indigo-600 text-white rounded-md"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindJobsPage;
