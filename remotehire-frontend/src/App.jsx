import React, { useState, useEffect } from "react";
import { LandingPage } from "./pages/LandingPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { DashboardPage } from "./pages/DashboardPage";
import JobPostsPage from "./pages/JobPostsPage";
import FindJobsPage from "./pages/FindJobsPage";
import CandidateDashboardPage from "./pages/CandidateDashboardPage";
import CandidateInterviewsPage from "./pages/CandidateInterviewsPage";
import RecruiterCandidatesPage from "./pages/RecruiterCandidatesPage";
import RecruiterInterviewsPage from "./pages/RecruiterInterviewsPage";
import RecruiterAnalyticsPage from "./pages/RecruiterAnalyticsPage";
import InterviewRoomPage from "./pages/InterviewRoomPage";
import { GitHubCallbackPage } from "./pages/GitHubCallbackPage";
import { LinkedInCallbackPage } from "./pages/LinkedInCallbackPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CandidateDetailsPage } from "./pages/CandidateDetailsPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

export const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored) return stored === "true";
    return false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const [currentPath, setCurrentPath] = useState(() => {
    // Check if callback routes (outside hash)
    if (window.location.pathname === "/auth/github/callback") {
      return "/auth/github/callback";
    }
    if (window.location.pathname === "/auth/linkedin/callback") {
      return "/auth/linkedin/callback";
    }
    const hash = window.location.hash.slice(1) || "/";
    return hash;
  });

  useEffect(() => {
    const onHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || "/");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  let page;

  // Handle dynamic candidate route
  const candidateMatch = currentPath.match(/^\/candidate\/(\d+)$/);
  // Handle interview room route with query params
  const interviewRoomMatch = currentPath.startsWith("/interview-room");

  switch (true) {
    case currentPath === "/auth/github/callback":
      page = <GitHubCallbackPage />;
      break;
    case currentPath === "/auth/linkedin/callback":
      page = <LinkedInCallbackPage />;
      break;
    case interviewRoomMatch:
      page = <InterviewRoomPage />;
      break;
    case !!candidateMatch:
      page = <CandidateDetailsPage />;
      break;
    case currentPath === "/signin":
      page = <SignInPage />;
      break;
    case currentPath === "/signup":
      page = <SignUpPage />;
      break;
    case currentPath.startsWith("/forgot-password"):
      page = <ForgotPasswordPage />;
      break;
    case currentPath.startsWith("/reset-password"):
      page = <ResetPasswordPage />;
      break;
    case currentPath === "/profile":
      page = <ProfilePage />;
      break;
    case currentPath === "/dashboard":
      page = <DashboardPage />;
      break;
    case currentPath === "/candidate-dashboard":
      page = <CandidateDashboardPage />;
      break;
    case currentPath === "/candidate-interviews":
      page = <CandidateInterviewsPage />;
      break;
    case currentPath === "/recruiter-candidates":
      page = <RecruiterCandidatesPage />;
      break;
    case currentPath === "/recruiter-interviews":
      page = <RecruiterInterviewsPage />;
      break;
    case currentPath === "/recruiter-analytics":
      page = <RecruiterAnalyticsPage />;
      break;
    case currentPath === "/job-posts":
      page = <JobPostsPage />;
      break;
    case currentPath === "/find-jobs":
      page = <FindJobsPage />;
      break;
    default:
      page = <LandingPage />;
      break;
  }

  return (
    <div className="min-h-screen">
      <main>{page}</main>
    </div>
  );
};
