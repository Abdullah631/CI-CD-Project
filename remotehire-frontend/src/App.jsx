import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { LandingPage } from "./pages/LandingPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { DashboardPage } from "./pages/DashboardPage";
import JobPostsPage from "./pages/JobPostsPage";
import FindJobsPage from "./pages/FindJobsPage";

export const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    // default to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    try {
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { darkMode } }));
    } catch (e) {}
  }, [darkMode]);

  useEffect(() => {
    const handler = () => setDarkMode((v) => !v);
    window.addEventListener('toggleTheme', handler);
    return () => window.removeEventListener('toggleTheme', handler);
  }, []);
  const [currentPath, setCurrentPath] = useState(
    window.location.hash.slice(1) || "/"
  );

  useEffect(() => {
    const onHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || "/");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  let page;
  let pageContainerClass = "bg-white";

  switch (currentPath) {
    case "/signin":
      page = <SignInPage />;
      pageContainerClass = "bg-slate-50";
      break;
    case "/signup":
      page = <SignUpPage />;
      pageContainerClass = "bg-slate-50";
      break;
    case "/dashboard":
      page = <DashboardPage />;
      pageContainerClass = "bg-white";
      break;
    case "/job-posts":
      page = <JobPostsPage />;
      pageContainerClass = "bg-slate-50";
      break;
    case "/find-jobs":
      page = <FindJobsPage />;
      pageContainerClass = "bg-slate-50";
      break;
    default:
      page = <LandingPage />;
      break;
  }

  return (
    <div className={`font-sans ${pageContainerClass}`}>
      {currentPath !== "/dashboard" && (
        <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode((v) => !v)} />
      )}
      <main>{page}</main>
    </div>
  );
};
