import React from "react";

export const LandingPage = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-24 sm:py-32">
    <div className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full mb-6">
      AI-Powered Recruitment Platform
    </div>
    <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight max-w-4xl mx-auto">
      Revolutionize hiring with{" "}
      <span className="text-blue-600">AI intelligence</span>
    </h1>
    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
      Streamline candidate evaluation with AI-powered CV analysis, deepfake
      detection for interviews, and real-time coding assessments—all in one
      platform.
    </p>
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a
        href="/#/signup"
        className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        Get Started Free &rarr;
      </a>
      <a
        href="#"
        className="w-full sm:w-auto bg-white text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        Watch Demo
      </a>
    </div>
  </div>
);
