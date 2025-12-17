import React from "react";
import BoltIcon from "@mui/icons-material/Bolt";

/** Simple, palette-driven landing navbar */
export const LandingNav = () => {
  return (
    <nav
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        background: "rgba(244, 239, 222, 0.78)",
        borderColor: "rgba(89, 66, 39, 0.16)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 group">
          <div
            className="p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
            style={{ background: "rgba(165, 185, 163, 0.4)" }}
          >
            <BoltIcon style={{ fontSize: 24, color: "#b2724d" }} />
          </div>
          <a
            href="/#/"
            className="text-xl font-bold"
            style={{ color: "#2f2416" }}
          >
            RemoteHire.io
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/#/signin"
            className="btn-ghost"
            style={{ padding: "0.65rem 1rem" }}
          >
            Sign In
          </a>
          <a
            href="/#/signup"
            className="btn-primary"
            style={{ padding: "0.75rem 1.1rem" }}
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
