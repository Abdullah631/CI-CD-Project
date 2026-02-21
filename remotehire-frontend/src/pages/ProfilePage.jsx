import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  FileText,
  Briefcase,
  Code,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import CandidateNav from "../components/CandidateNav";

export const ProfilePage = () => {
  const [profile, setProfile] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    username: "",
    photo: null,
    cv: null,
    cv_metadata: {},
    cv_last_updated: null,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [userName, setUserName] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const token = localStorage.getItem("token");

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
    fetchProfile();
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${window.API_BASE_URL}/api/candidate/profile/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleCvChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleViewCV = async () => {
    try {
      const userId =
        profile.id || JSON.parse(atob(token.split(".")[1])).user_id;
      const response = await axios.get(
        `${window.API_BASE_URL}/api/candidate/${userId}/cv/view/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If S3 is enabled, response will contain view_url
      if (response.data.view_url) {
        window.open(response.data.view_url, "_blank");
      } else {
        // Fallback for local file storage
        window.open(profile.cv, "_blank");
      }
    } catch (err) {
      console.error("Error viewing CV:", err);
      // Fallback to direct URL
      if (profile.cv) {
        window.open(profile.cv, "_blank");
      }
    }
  };

  const handleDownloadCV = async () => {
    try {
      const userId =
        profile.id || JSON.parse(atob(token.split(".")[1])).user_id;
      const response = await axios.get(
        `${window.API_BASE_URL}/api/candidate/${userId}/cv/download/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // If S3 is enabled, response will contain download_url
      if (response.data.download_url) {
        window.open(response.data.download_url, "_blank");
      } else {
        // Fallback for local file storage
        window.open(profile.cv, "_blank");
      }
    } catch (err) {
      console.error("Error downloading CV:", err);
      // Fallback to direct URL
      if (profile.cv) {
        window.open(profile.cv, "_blank");
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put(
        `${window.API_BASE_URL}/api/candidate/profile/`,
        {
          full_name: profile.full_name,
          phone_number: profile.phone_number,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(response.data);
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCV = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      setError("Please select a CV file");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("cv", cvFile);

      const response = await axios.post(
        `${window.API_BASE_URL}/api/candidate/upload-cv/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Check if metadata has errors
      if (response.data.metadata && response.data.metadata.error) {
        setError(`CV Analysis Warning: ${response.data.metadata.error}. The file was stored but AI analysis encountered an issue.`);
      } else {
        setSuccess("CV uploaded and processed successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }

      setProfile((prev) => ({
        ...prev,
        cv: response.data.cv_url,
        cv_metadata: response.data.metadata,
        cv_last_updated: new Date().toISOString(),
      }));
      setCvFile(null);
    } catch (err) {
      console.error("Error uploading CV:", err);
      setError(err.response?.data?.error || "Failed to upload CV");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800"
            : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      <CandidateNav
        darkMode={darkMode}
        onToggleDarkMode={() => {
          setDarkMode(!darkMode);
          localStorage.setItem("darkMode", !darkMode);
        }}
        userName={userName}
        currentPage="profile"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Messages */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 animate-slideDown ${
              darkMode
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-red-50/80 border-red-200 text-red-700"
            }`}
          >
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 animate-slideDown ${
              darkMode
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : "bg-green-50/80 border-green-200 text-green-700"
            }`}
          >
            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Personal Information Section */}
        <div
          className={`rounded-3xl border backdrop-blur transition-all duration-300 overflow-hidden mb-8 ${
            darkMode
              ? "bg-slate-800/40 border-slate-700/50 shadow-xl shadow-black/20"
              : "bg-white/60 border-blue-100/50 shadow-lg shadow-blue-500/5"
          }`}
        >
          {/* Section Header */}
          <div
            className={`px-8 py-6 border-b transition-all duration-300 ${
              darkMode
                ? "bg-indigo-600/10 border-slate-700/50"
                : "bg-blue-600/5 border-blue-100/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    darkMode ? "bg-indigo-600/30" : "bg-blue-100"
                  }`}
                >
                  <User
                    size={20}
                    className={darkMode ? "text-indigo-400" : "text-blue-600"}
                  />
                </div>
                <div>
                  <h2
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Personal Information
                  </h2>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Update your profile details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  editing
                    ? darkMode
                      ? "bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30"
                      : "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                    : darkMode
                    ? "bg-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 border border-blue-300/50"
                }`}
              >
                {editing ? "✕ Cancel" : "✎ Edit Profile"}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Full Name */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 border font-medium ${
                      darkMode
                        ? `bg-slate-700/30 border-slate-600/50 text-white placeholder-slate-500 ${
                            editing
                              ? "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                              : "opacity-60 cursor-not-allowed"
                          }`
                        : `bg-white border-blue-100 text-slate-900 placeholder-slate-400 ${
                            editing
                              ? "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              : "opacity-60 cursor-not-allowed"
                          }`
                    }`}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={profile.phone_number}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full px-4 py-3 rounded-xl transition-all duration-300 border font-medium ${
                      darkMode
                        ? `bg-slate-700/30 border-slate-600/50 text-white placeholder-slate-500 ${
                            editing
                              ? "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                              : "opacity-60 cursor-not-allowed"
                          }`
                        : `bg-white border-blue-100 text-slate-900 placeholder-slate-400 ${
                            editing
                              ? "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                              : "opacity-60 cursor-not-allowed"
                          }`
                    }`}
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 font-medium opacity-60 cursor-not-allowed ${
                      darkMode
                        ? "bg-slate-700/20 border-slate-600/30 text-slate-400"
                        : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  />
                </div>

                {/* Username (Read-only) */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${
                      darkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    <User size={16} />
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    disabled
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 font-medium opacity-60 cursor-not-allowed ${
                      darkMode
                        ? "bg-slate-700/20 border-slate-600/30 text-slate-400"
                        : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  />
                </div>
              </div>

              {/* Save Button */}
              {editing && (
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 border border-blue-300/50"
                  }`}
                >
                  {saving ? "💾 Saving..." : "✓ Save Changes"}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* CV Upload Section */}
        <div
          className={`rounded-3xl border backdrop-blur transition-all duration-300 overflow-hidden mb-8 ${
            darkMode
              ? "bg-slate-800/40 border-slate-700/50 shadow-xl shadow-black/20"
              : "bg-white/60 border-blue-100/50 shadow-lg shadow-blue-500/5"
          }`}
        >
          {/* Section Header */}
          <div
            className={`px-8 py-6 border-b transition-all duration-300 ${
              darkMode
                ? "bg-purple-600/10 border-slate-700/50"
                : "bg-purple-600/5 border-blue-100/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  darkMode ? "bg-purple-600/30" : "bg-purple-100"
                }`}
              >
                <FileText
                  size={20}
                  className={darkMode ? "text-purple-400" : "text-purple-600"}
                />
              </div>
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  CV Management
                </h2>
                <p
                  className={`text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Upload and manage your CV
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Current CV Status */}
            {profile.cv ? (
              <div
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  darkMode
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-green-50/80 border-green-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle
                    size={24}
                    className={darkMode ? "text-green-400" : "text-green-600"}
                  />
                  <div>
                    <p
                      className={`font-bold mb-2 ${
                        darkMode ? "text-green-300" : "text-green-700"
                      }`}
                    >
                      CV uploaded and processed
                    </p>
                    <div className="flex gap-3 mb-3">
                      <button
                        onClick={handleViewCV}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                          darkMode
                            ? "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
                        }`}
                      >
                        View CV
                      </button>
                      <button
                        onClick={handleDownloadCV}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                          darkMode
                            ? "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30"
                            : "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
                        }`}
                      >
                        Download CV
                      </button>
                    </div>
                    {profile.cv_last_updated && (
                      <p
                        className={`text-sm ${
                          darkMode ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Last updated:{" "}
                        {new Date(profile.cv_last_updated).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* CV Upload Form */}
            <form onSubmit={handleUploadCV}>
              <div className="mb-4">
                <label
                  className={`block text-sm font-semibold mb-3 flex items-center gap-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <FileText size={16} />
                  Upload CV (PDF, DOC, DOCX, TXT)
                </label>
                <div
                  className={`relative px-6 py-6 rounded-2xl border-2 border-dashed transition-all duration-300 text-center cursor-pointer hover:border-opacity-100 ${
                    darkMode
                      ? "border-slate-600/50 hover:bg-slate-700/20"
                      : "border-blue-200 hover:bg-blue-50/50"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleCvChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="pointer-events-none">
                    <div
                      className={`text-3xl mb-2 ${
                        cvFile ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      📁
                    </div>
                    <p
                      className={`font-semibold ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {cvFile
                        ? cvFile.name
                        : "Click to upload or drag and drop"}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        darkMode ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      PDF, DOC, DOCX, or TXT
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!cvFile || uploading}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  darkMode
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/50 border border-purple-500/50"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/30 border border-purple-300/50"
                }`}
              >
                {uploading ? "⏳ Processing..." : "Upload and Process CV"}
              </button>
            </form>
          </div>
        </div>

        {/* CV Metadata Section */}
        {profile.cv_metadata && Object.keys(profile.cv_metadata).length > 0 && !profile.cv_metadata.error && (
          <div
            className={`rounded-3xl border backdrop-blur transition-all duration-300 overflow-hidden ${
              darkMode
                ? "bg-slate-800/40 border-slate-700/50 shadow-xl shadow-black/20"
                : "bg-white/60 border-blue-100/50 shadow-lg shadow-blue-500/5"
            }`}
          >
            {/* Section Header */}
            <div
              className={`px-8 py-6 border-b transition-all duration-300 ${
                darkMode
                  ? "bg-orange-600/10 border-slate-700/50"
                  : "bg-orange-600/5 border-blue-100/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    darkMode ? "bg-orange-600/30" : "bg-orange-100"
                  }`}
                >
                  <BookOpen
                    size={20}
                    className={darkMode ? "text-orange-400" : "text-orange-600"}
                  />
                </div>
                <div>
                  <h2
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Extracted CV Information
                  </h2>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Your CV has been analyzed by our AI
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata Content */}
            <div className="p-8 space-y-8">
              {/* Basic Info */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {profile.cv_metadata.full_name && (
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
                        <User size={14} />
                        Full Name
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          darkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {profile.cv_metadata.full_name}
                      </p>
                    </div>
                  )}

                  {profile.cv_metadata.current_title && (
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
                        {profile.cv_metadata.current_title}
                      </p>
                    </div>
                  )}

                  {profile.cv_metadata.years_of_experience && (
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
                        <Calendar size={14} />
                        Experience
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          darkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {profile.cv_metadata.years_of_experience}+ years
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {profile.cv_metadata.skills &&
                profile.cv_metadata.skills.length > 0 && (
                  <div>
                    <h3
                      className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Code
                        size={20}
                        className={darkMode ? "text-blue-400" : "text-blue-600"}
                      />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.cv_metadata.skills.map((skill, idx) => (
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
              {profile.cv_metadata.programming_languages &&
                profile.cv_metadata.programming_languages.length > 0 && (
                  <div>
                    <h3
                      className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Code
                        size={20}
                        className={
                          darkMode ? "text-purple-400" : "text-purple-600"
                        }
                      />
                      Programming Languages
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.cv_metadata.programming_languages.map(
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

              {/* Education */}
              {profile.cv_metadata.education &&
                profile.cv_metadata.education.length > 0 && (
                  <div>
                    <h3
                      className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <BookOpen
                        size={20}
                        className={
                          darkMode ? "text-indigo-400" : "text-indigo-600"
                        }
                      />
                      Education
                    </h3>
                    <div className="space-y-3">
                      {profile.cv_metadata.education.map((edu, idx) => (
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
              {profile.cv_metadata.work_experience &&
                profile.cv_metadata.work_experience.length > 0 && (
                  <div>
                    <h3
                      className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Briefcase
                        size={20}
                        className={
                          darkMode ? "text-green-400" : "text-green-600"
                        }
                      />
                      Work Experience
                    </h3>
                    <div className="space-y-3">
                      {profile.cv_metadata.work_experience.map((exp, idx) => (
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
              {profile.cv_metadata.certifications &&
                profile.cv_metadata.certifications.length > 0 && (
                  <div>
                    <h3
                      className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Award
                        size={20}
                        className={
                          darkMode ? "text-yellow-400" : "text-yellow-600"
                        }
                      />
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {profile.cv_metadata.certifications.map((cert, idx) => (
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
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
