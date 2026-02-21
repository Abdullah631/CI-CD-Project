import React, { useState } from "react";
import { ArrowRight, Zap, CheckCircle, Users, BarChart3 } from "lucide-react";
import { LandingNav } from "../components/LandingNav";
export const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const features = [
    {
      icon: Zap,
      title: "AI-Powered CV Analysis",
      description:
        "Extract key information from CVs automatically using advanced AI models",
      color: "from-blue-600 to-indigo-600",
    },
    {
      icon: Users,
      title: "Smart Candidate Matching",
      description:
        "Match candidates with perfect jobs using intelligent similarity scoring",
      color: "from-purple-600 to-pink-600",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description:
        "Track applications, manage candidates, and optimize your hiring funnel",
      color: "from-green-600 to-emerald-600",
    },
    {
      icon: CheckCircle,
      title: "Verified Credentials",
      description:
        "Automatic skill verification and experience validation for all candidates",
      color: "from-orange-600 to-red-600",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      {/* Dark Mode Toggle is now inside the navbar */}

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl ${
            darkMode ? "bg-indigo-600" : "bg-blue-600"
          }`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl ${
            darkMode ? "bg-purple-600" : "bg-indigo-600"
          }`}
        ></div>
      </div>

      {/* Navigation */}
      <LandingNav
        darkMode={darkMode}
        onToggleDarkMode={() => {
          setDarkMode(!darkMode);
          localStorage.setItem("darkMode", !darkMode);
        }}
      />
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative z-10">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur transition-all duration-300 ${
              darkMode
                ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-300"
                : "bg-blue-100/60 border-blue-200/80 text-blue-700"
            }`}
          >
            <span className="text-lg">⚡</span>
            <span className="font-semibold">
              AI-Powered Recruitment Platform
            </span>
          </div>
        </div>

        {/* Main Title */}
        <h1
          className={`text-5xl sm:text-6xl lg:text-7xl font-bold text-center mb-6 leading-tight transition-colors duration-300 ${
            darkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Revolutionize Hiring with{" "}
          <span
            className={`bg-gradient-to-r ${
              darkMode
                ? "from-indigo-400 to-purple-400"
                : "from-blue-600 to-indigo-600"
            } bg-clip-text text-transparent`}
          >
            AI Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-lg sm:text-xl text-center max-w-3xl mx-auto mb-12 transition-colors duration-300 ${
            darkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Streamline candidate evaluation with AI-powered CV analysis,
          intelligent matching, and real-time assessments—all in one powerful
          platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a
            href="/#/signup"
            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-semibold transition-all duration-300 
    flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95
    text-white hover:text-white active:text-white ${
      darkMode
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50 border border-indigo-500/50"
        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 border border-blue-300/50"
    }`}
          >
            Get Started Free
            <ArrowRight size={20} className="text-white" />
          </a>
          
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl border backdrop-blur transition-all duration-300 overflow-hidden group hover:scale-105 ${
                  darkMode
                    ? "bg-slate-800/40 border-slate-700/50 hover:border-slate-700/80 shadow-xl shadow-black/10"
                    : "bg-white/60 border-blue-100/50 hover:border-blue-200/80 shadow-lg shadow-blue-500/5"
                }`}
              >
                <div
                  className={`p-8 h-full flex flex-col ${
                    darkMode
                      ? "bg-gradient-to-br from-slate-800 to-transparent"
                      : "bg-gradient-to-br from-white to-transparent"
                  }`}
                >
                  <div
                    className={`p-4 rounded-xl w-fit mb-4 transition-all duration-300 group-hover:scale-110 bg-gradient-to-r ${feature.color}`}
                  >
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3
                    className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`transition-colors duration-300 ${
                      darkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div
          className={`rounded-3xl border backdrop-blur transition-all duration-300 overflow-hidden ${
            darkMode
              ? "bg-slate-800/40 border-slate-700/50 shadow-xl shadow-black/20"
              : "bg-white/60 border-blue-100/50 shadow-lg shadow-blue-500/5"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12">
            {[
              { label: "Active Jobs", value: "1000+", emoji: "🎯" },
              { label: "Candidates", value: "50K+", emoji: "👥" },
              { label: "Placements", value: "95%", emoji: "🎉" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-2">{stat.emoji}</div>
                <div
                  className={`text-4xl font-bold mb-2 bg-gradient-to-r ${
                    darkMode
                      ? "from-indigo-400 to-purple-400"
                      : "from-blue-600 to-indigo-600"
                  } bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <p
                  className={`text-sm font-semibold ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`border-t transition-all duration-300 mt-20 ${
          darkMode
            ? "bg-slate-800/50 border-slate-700/50"
            : "bg-white/50 border-blue-100/50"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p
            className={`text-sm ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            © 2024 RemoteHire.io. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
