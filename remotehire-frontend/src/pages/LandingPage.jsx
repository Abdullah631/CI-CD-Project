import React from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import { LandingNav } from "../components/LandingNav";
import landingImg from "../assets/landing.jpg";

const features = [
  {
    title: "Smart CV Parsing",
    description:
      "AI extracts skills, experience, and qualifications instantly from any resume format.",
    color: "var(--sage)",
  },
  {
    title: "Live Interview Rooms",
    description:
      "Video calls, code editors, and whiteboards in one seamless experience.",
    color: "var(--cinnamon)",
  },
  {
    title: "Bias-Free Scoring",
    description:
      "Structured evaluations help teams make fair, data-driven hiring decisions.",
    color: "var(--sage)",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload & Parse",
    description:
      "Drop CVs or paste LinkedIn profiles. Our AI builds structured candidate profiles in seconds.",
  },
  {
    number: "02",
    title: "Interview & Collaborate",
    description:
      "Launch video rooms with integrated coding pads. Take notes and score candidates in real-time.",
  },
  {
    number: "03",
    title: "Decide & Hire",
    description:
      "Review ranked shortlists, compare candidates side-by-side, and extend offers confidently.",
  },
];

const stats = [
  { value: "48%", label: "Faster hiring cycle" },
  { value: "4.6x", label: "More candidates reviewed" },
  { value: "31%", label: "Higher offer acceptance" },
];

export const LandingPage = () => {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url(${landingImg})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--sage) 0%, transparent 70%)",
            filter: "blur(60px)",
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute top-1/2 -left-40 w-80 h-80 rounded-full opacity-25 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--cinnamon) 0%, transparent 70%)",
            filter: "blur(60px)",
            animationDuration: "5s",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full opacity-20 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--tan) 0%, transparent 70%)",
            filter: "blur(60px)",
            animationDuration: "6s",
            animationDelay: "2s",
          }}
        />
      </div>

      <LandingNav />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-bounce"
              style={{
                background: "rgba(165, 185, 163, 0.2)",
                border: "1px solid var(--border-strong)",
                animationDuration: "2s",
              }}
            >
              <span style={{ color: "var(--cinnamon)" }}>✨</span>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                AI-Powered Hiring Platform
              </span>
            </div>

            {/* Main heading with gradient */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Hire smarter,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--cinnamon), var(--sage))",
                }}
              >
                faster
              </span>
              , and with confidence.
            </h1>

            <p
              className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              RemoteHire combines AI-powered CV parsing, live interview rooms,
              and structured scoring to help teams find the perfect candidates.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <a
                href="/#/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--cinnamon), var(--sage))",
                  color: "var(--cream)",
                  boxShadow: "0 10px 40px rgba(178, 114, 77, 0.3)",
                }}
              >
                Get Started Free
              </a>
              <a
                href="/#/find-jobs"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: "var(--surface-0)",
                  color: "var(--text-primary)",
                  border: "2px solid var(--border-strong)",
                }}
              >
                Browse Jobs
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6">
              {[
                "No credit card required",
                "Free forever plan",
                "Setup in 2 minutes",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span style={{ color: "var(--sage)" }}>✅</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Everything you need to hire remotely
            </h2>
            <p
              style={{ color: "var(--text-secondary)" }}
              className="text-lg max-w-2xl mx-auto"
            >
              A complete toolkit designed for modern distributed teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                  style={{
                    background:
                      "linear-gradient(145deg, var(--surface-0), var(--surface-1))",
                    border: "1px solid var(--border-strong)",
                    boxShadow: "0 20px 40px rgba(36, 26, 15, 0.1)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: `${feature.color}20` }}
                  >
                    <BoltIcon style={{ fontSize: 20, color: feature.color }} />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{ color: "var(--text-secondary)" }}
                    className="leading-relaxed"
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20" style={{ background: "var(--surface-0)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background: "rgba(178, 114, 77, 0.15)",
                  border: "1px solid var(--border-strong)",
                }}
              >
                <BoltIcon style={{ fontSize: 16, color: "var(--cinnamon)" }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Simple 3-Step Process
                </span>
              </span>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                From CV to hired in record time
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="relative p-8 rounded-2xl transition-all duration-300 hover:shadow-xl"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border-strong)",
                  }}
                >
                  {/* Step number */}
                  <div
                    className="text-6xl font-bold mb-4 opacity-20"
                    style={{ color: "var(--cinnamon)" }}
                  >
                    {step.number}
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{ color: "var(--text-secondary)" }}
                    className="leading-relaxed"
                  >
                    {step.description}
                  </p>

                  {/* Connector line */}
                  {idx < steps.length - 1 && (
                    <div
                      className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5"
                      style={{ background: "var(--border-stronger)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="text-center p-8 rounded-2xl transition-all duration-300 hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(145deg, var(--surface-0), var(--surface-1))",
                    border: "1px solid var(--border-strong)",
                    boxShadow: "0 15px 35px rgba(36, 26, 15, 0.08)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(165, 185, 163, 0.2)" }}
                  >
                    <InsertChartIcon
                      style={{ fontSize: 20, color: "var(--cinnamon)" }}
                    />
                  </div>
                  <div
                    className="text-4xl font-bold mb-2"
                    style={{ color: "var(--cinnamon)" }}
                  >
                    {stat.value}
                  </div>
                  <p
                    style={{ color: "var(--text-secondary)" }}
                    className="font-medium"
                  >
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 py-20">
          <div
            className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, var(--cinnamon), var(--sage))",
              boxShadow: "0 30px 60px rgba(178, 114, 77, 0.25)",
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20"
              style={{ background: "var(--cream)" }}
            />
            <div
              className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-15"
              style={{ background: "var(--cream)" }}
            />

            <div className="relative z-10">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: "var(--cream)" }}
              >
                Ready to transform your hiring?
              </h2>
              <p
                className="text-lg mb-8 opacity-90 max-w-xl mx-auto"
                style={{ color: "var(--cream)" }}
              >
                Join thousands of companies using RemoteHire to build
                world-class remote teams.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/#/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
                  style={{
                    background: "var(--cream)",
                    color: "var(--cinnamon)",
                  }}
                >
                  Start Hiring Today
                </a>
                <a
                  href="/#/signin"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
                  style={{
                    background: "transparent",
                    color: "var(--cream)",
                    border: "2px solid var(--cream)",
                  }}
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="py-12 text-center border-t"
          style={{
            borderColor: "var(--border-strong)",
            color: "var(--text-secondary)",
          }}
        >
          <p className="text-sm">
            © 2024 RemoteHire.io · Built with ❤️ for distributed teams
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
