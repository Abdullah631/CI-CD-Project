import React, { useState, useEffect } from "react";
import axios from "axios";

export const JobPostsPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // check local user role
  const storedUserRaw = localStorage.getItem("user");
  let storedUser = null;
  try {
    storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  } catch {
    storedUser = null;
  }

  const token = localStorage.getItem("token");

  useEffect(() => {
    // fetch recruiter jobs
    const fetchJobs = async () => {
      if (!token) return;
      // read user fresh from localStorage to avoid stale closure
      const storedUserRaw = localStorage.getItem('user');
      let currUser = null;
      try {
        currUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
      } catch { currUser = null; }
      if (!currUser || currUser.role !== 'recruiter') return;
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
    // notify other parts of the app that jobs changed
    try {
      window.dispatchEvent(new CustomEvent('jobsUpdated'));
      localStorage.setItem('jobs_updated', Date.now().toString());
    } catch { /* ignore */ }
  }, [token]);

  // If the local user is not a recruiter, redirect away to dashboard to avoid
  // calling recruiter-only endpoints (prevents 403 Forbidden calls).
  useEffect(() => {
    const raw = localStorage.getItem('user');
    let parsed = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch { parsed = null; }
    if (!parsed || parsed.role !== 'recruiter') {
      window.location.href = '/#/dashboard';
    }
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setActionLoading(true);
    try {
      if (editingJobId) {
        // Update existing job
        const res = await axios.put(
          `http://127.0.0.1:8000/api/recruiter/jobs/${editingJobId}/`,
          { title, description, status },
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        setSuccess(res.data?.message || 'Job updated');
      } else {
        // Create new job
        const res = await axios.post(
          "http://127.0.0.1:8000/api/recruiter/jobs/add/",
          { title, description, status },
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        if (res.status === 201) {
          setSuccess(res.data.message || "Job created");
        }
      }
      // refresh jobs
      const list = await axios.get(
        "http://127.0.0.1:8000/api/recruiter/jobs/",
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setJobs(list.data || []);
        // notify other parts of the app that jobs changed
        try {
          window.dispatchEvent(new CustomEvent('jobsUpdated'));
          localStorage.setItem('jobs_updated', Date.now().toString());
        } catch {
          // ignore
        }
      // reset form
      setTitle("");
      setDescription("");
      setStatus("active");
      setShowForm(false);
      setEditingJobId(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save job");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (job) => {
    setEditingJobId(job.id);
    setTitle(job.title || '');
    setDescription(job.description || '');
    setStatus(job.status || 'active');
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.delete(
        `http://127.0.0.1:8000/api/recruiter/jobs/${jobId}/`,
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );
      setSuccess(res.data?.message || 'Job deleted');
      const list = await axios.get(
        "http://127.0.0.1:8000/api/recruiter/jobs/",
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      setJobs(list.data || []);
        // notify other parts of the app that jobs changed
        try {
          window.dispatchEvent(new CustomEvent('jobsUpdated'));
          localStorage.setItem('jobs_updated', Date.now().toString());
        } catch {
          // ignore
        }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete job');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
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
            className="bg-white p-6 rounded-lg shadow mb-6 w-full"
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

        <div className="space-y-4 w-full">
          {jobs.length === 0 && (
            <div className="text-sm text-gray-600">No job posts yet.</div>
          )}
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center w-full"
            >
              <div>
                <h3 className="font-bold">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 mr-4">{job.status}</div>
                <button
                  onClick={() => handleEditClick(job)}
                  className="py-1 px-3 bg-yellow-100 text-yellow-700 rounded-md text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  disabled={actionLoading}
                  className="py-1 px-3 bg-red-100 text-red-700 rounded-md text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobPostsPage;
