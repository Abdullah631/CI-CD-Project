import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { LandingPage } from "./pages/LandingPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { DashboardPage } from "./pages/DashboardPage";

export const App = () => {
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
    default:
      page = <LandingPage />;
      break;
  }

  return (
    <div className={`font-sans ${pageContainerClass}`}>
      {currentPath !== "/dashboard" && <Header />}
      <main>{page}</main>
    </div>
  );
};
