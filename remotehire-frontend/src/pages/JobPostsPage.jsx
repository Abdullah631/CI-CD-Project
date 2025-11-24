import React, { useState, useEffect } from "react";
import axios from "axios";

export const JobPostsPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  // check local user role
  const storedUserRaw = localStorage.getItem("user");
  let storedUser = null;
  try {
    storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  } catch (e) {
    storedUser = null;
  }

  const token = localStorage.getItem("token");

  useEffect(() => {
    // fetch recruiter jobs
    const fetchJobs = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/recruiter/jobs/",
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }
        );
        setJobs(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs");
      }
    };
    fetchJobs();
  }, [token]);

  const handleAddJob = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/recruiter/jobs/add/",
        { title, description, status },
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );
      if (res.status === 201) {
        setSuccess(res.data.message || "Job created");
        setTitle("");
        setDescription("");
        setShowForm(false);
        // refresh jobs
        const list = await axios.get(
          "http://127.0.0.1:8000/api/recruiter/jobs/",
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }
        );
        setJobs(list.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Job Posts</h1>
          <a href="/#/dashboard" className="text-sm text-blue-600">
            Back to dashboard
          </a>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 mb-4">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-700 mb-4">{success}</div>
        )}

        {showForm ? (
          <form
            onSubmit={handleAddJob}
            className="bg-white p-6 rounded-lg shadow mb-6"
          >
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Job Title</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                  rows={4}
                />
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="py-2 px-4 bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    className="py-2 px-4 bg-indigo-600 text-white rounded-md"
                  >
                    {loading ? "Saving..." : "Post Job"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          storedUser?.role === "recruiter" && (
            <div className="mb-6">
              <button
                onClick={() => setShowForm(true)}
                className="py-2 px-4 bg-indigo-600 text-white rounded-md"
              >
                Create Job Opening
              </button>
            </div>
          )
        )}

        <div className="space-y-4">
          {jobs.length === 0 && (
            <div className="text-sm text-gray-600">No job posts yet.</div>
          )}
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.description}</p>
              </div>
              <div className="text-sm text-gray-600">{job.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobPostsPage;
