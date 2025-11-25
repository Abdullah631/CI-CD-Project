import React, { useState, useEffect } from "react";
import {
  LogoIcon,
  SunIcon,
  BriefcaseIcon,
  CheckSquareIcon,
  ChatIcon,
  UserIcon,
  MessageIcon,
  SettingsIcon,
  LogoutIcon,
} from "../components/Icons";
import { MoonIcon } from "../components/Icons";

export const DashboardPage = () => {
  const [userRole, setUserRole] = useState("candidate");
  const [userName, setUserName] = useState("");
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [activeCandidatesCount, setActiveCandidatesCount] = useState(0);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState(null);
  const [darkModeLocal, setDarkModeLocal] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserRole(userData.role || "candidate");
        setUserName(userData.username || "User");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      // Redirect to signin if no user data
      window.location.href = "/#/signin";
    }
  }, []);

  useEffect(() => {
    // Fetch recruiter's jobs and compute active jobs count
    if (userRole !== 'recruiter') return;
    let aborted = false;
    const token = localStorage.getItem('token');
    if (!token) {
      setActiveJobsCount(0);
      return;
    }
    setJobsLoading(true);
    setJobsError(null);
    fetch('http://localhost:8000/api/recruiter/jobs/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const active = data.filter((j) => (j.status || '').toLowerCase() === 'active').length;
          setActiveJobsCount(active);
        } else {
          setActiveJobsCount(0);
        }
      })
      .catch((err) => {
        console.error('Error fetching recruiter jobs:', err);
        setJobsError(err.message || 'Failed to load jobs');
        if (!aborted) setActiveJobsCount(0);
      })
      .finally(() => { if (!aborted) setJobsLoading(false); });
  }, [userRole]);


  // Listen for jobs updates from other pages/components and re-fetch
  useEffect(() => {
    const fetchActiveJobs = () => {
      if (userRole !== 'recruiter') return;
      const token = localStorage.getItem('token');
      if (!token) {
        setActiveJobsCount(0);
        return;
      }
      setJobsLoading(true);
      setJobsError(null);
      fetch('http://localhost:8000/api/recruiter/jobs/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`API error: ${res.status} ${text}`);
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            const active = data.filter((j) => (j.status || '').toLowerCase() === 'active').length;
            setActiveJobsCount(active);
          } else {
            setActiveJobsCount(0);
          }
        })
        .catch((err) => {
          console.error('Error fetching recruiter jobs:', err);
          setJobsError(err.message || 'Failed to load jobs');
          setActiveJobsCount(0);
        })
        .finally(() => setJobsLoading(false));
    };

    const handler = () => fetchActiveJobs();
    const storageHandler = (e) => {
      if (e.key === 'jobs_updated') fetchActiveJobs();
    };

    window.addEventListener('jobsUpdated', handler);
    window.addEventListener('storage', storageHandler);

    // cleanup
    return () => {
      window.removeEventListener('jobsUpdated', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, [userRole]);

  // Listen for theme changes so we can update the icon in this page
  useEffect(() => {
    const handler = (e) => {
      // themeChanged detail has { darkMode }
      try {
        const dm = e?.detail?.darkMode;
        if (typeof dm === 'boolean') setDarkModeLocal(dm);
        else setDarkModeLocal(document.documentElement.classList.contains('dark'));
      } catch (err) {
        setDarkModeLocal(document.documentElement.classList.contains('dark'));
      }
    };
    window.addEventListener('themeChanged', handler);
    // Also listen for toggle events in case this page triggers toggle
    const toggleHandler = () => setDarkModeLocal((v) => !v);
    window.addEventListener('toggleTheme', toggleHandler);
    return () => {
      window.removeEventListener('themeChanged', handler);
      window.removeEventListener('toggleTheme', toggleHandler);
    };
  }, []);


  // Fetch active candidates count (recruiter view)
  useEffect(() => {
    if (userRole !== 'recruiter') return;
    const token = localStorage.getItem('token');
    if (!token) {
      setActiveCandidatesCount(0);
      return;
    }
    setCandidatesLoading(true);
    setCandidatesError(null);
    fetch('http://localhost:8000/api/recruiter/active-candidates/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.count === 'number') {
          setActiveCandidatesCount(data.count);
        } else {
          setActiveCandidatesCount(0);
        }
      })
      .catch((err) => {
        console.error('Error fetching active candidates:', err);
        setCandidatesError(err.message || 'Failed to load candidates');
        setActiveCandidatesCount(0);
      })
      .finally(() => setCandidatesLoading(false));
  }, [userRole]);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Redirect to sign in
    window.location.href = "/#/signin";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <LogoIcon />
            <span className="text-xl font-bold text-gray-900">RemoteHire</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-6 space-y-2">
          <div className="mb-8">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 4l4 2m-4-2L9 9m9 11l-4-2m4 2l4-2"
                />
              </svg>
              Dashboard
            </button>
          </div>

          {userRole === "candidate" ? (
            // Candidate Navigation
            <>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              onClick={() => (window.location.href = "/#/find-jobs")}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Find Jobs
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <CheckSquareIcon />
                Assessments
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <UserIcon />
                Profile
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <MessageIcon />
                Messages
              </button>
            </>
          ) : (
            // Recruiter Navigation
            <>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <BriefcaseIcon />
                <span
                  onClick={() => (window.location.href = "/#/job-posts")}
                  className="cursor-pointer"
                >
                  Job Posts
                </span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <UserIcon />
                Candidates
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Interviews
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Analytics
              </button>
            </>
          )}
        </nav>

        {/* Bottom Menu */}
        <div className="absolute bottom-0 w-64 p-6 border-t bg-white space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
            <SettingsIcon />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {userRole === "candidate" ? "Candidate" : "Recruiter"}!
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => window.dispatchEvent(new CustomEvent('toggleTheme'))} aria-label="Toggle theme">
                {darkModeLocal ? <MoonIcon /> : <SunIcon />}
              </button>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {userRole === "candidate" ? "C" : "R"}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          {userRole === "candidate" ? (
            // CANDIDATE DASHBOARD
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Applications Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Applications</p>
                      <p className="text-4xl font-bold text-gray-900">5</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Interviews Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Interviews</p>
                      <p className="text-4xl font-bold text-gray-900">2</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Completed Tests Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">
                        Completed Tests
                      </p>
                      <p className="text-4xl font-bold text-gray-900">3</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 pb-4 border-b">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      Applied to Senior React Developer
                    </p>
                  </div>
                  <div className="flex items-start gap-4 pb-4 border-b">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      Completed JavaScript Assessment
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">
                      Scheduled Interview with TechCorp
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // RECRUITER DASHBOARD
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                {/* Active Jobs Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Active Jobs</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {jobsLoading ? '...' : activeJobsCount}
                      </p>
                      {jobsError && (
                        <p className="text-sm text-red-500 mt-1">Failed to load</p>
                      )}
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Active Candidates Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">
                        Active Candidates
                      </p>
                      <p className="text-4xl font-bold text-gray-900">
                        {candidatesLoading ? '...' : activeCandidatesCount}
                      </p>
                      {candidatesError && (
                        <p className="text-sm text-red-500 mt-1">Failed to load</p>
                      )}
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM12.6 20.89l-.06-.06a6 6 0 00-8.54 0l-.06.06A6 6 0 004 12a6 6 0 1012 0c0-1.468-.356-2.854-.94-4.07M5 19H3v-2a6 6 0 0112 0v2h-2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Interviews Scheduled Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">
                        Interviews Scheduled
                      </p>
                      <p className="text-4xl font-bold text-gray-900">12</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Offers Sent Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Offers Sent</p>
                      <p className="text-4xl font-bold text-gray-900">5</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Applicants and Pipeline Status */}
              <div className="grid grid-cols-2 gap-6">
                {/* Recent Applicants */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Recent Applicants
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <p className="text-gray-700 font-medium">
                        Alice Johnson - React Dev
                      </p>
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </a>
                    </div>
                    <div className="flex items-center justify-between pb-4 border-b">
                      <p className="text-gray-700 font-medium">
                        Bob Smith - Full Stack
                      </p>
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-700 font-medium">
                        Carol Davis - UI Designer
                      </p>
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>

                {/* Pipeline Status */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Pipeline Status
                  </h2>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-700 font-medium">Applied</p>
                      <p className="text-2xl font-bold text-gray-900">42</p>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b">
                      <p className="text-gray-700 font-medium">Screening</p>
                      <p className="text-2xl font-bold text-gray-900">15</p>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b">
                      <p className="text-gray-700 font-medium">Interview</p>
                      <p className="text-2xl font-bold text-blue-600">8</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-700 font-medium">Offer</p>
                      <p className="text-2xl font-bold text-gray-900">5</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
