import { useState } from "react";
import PublicHeader from "../components/PublicHeader";
import Modal from "../components/Modal";
import CandidateLoginPage from "./CandidateLoginPage";
import Footer from "../components/layout/Footer";
import { ArrowRight, FileText, Trophy, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "ATS-Optimized Resumes",
    description: "Get recruiter-crafted resumes tailored to beat ATS systems and land interviews faster.",
    accent: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    icon: Zap,
    title: "Fast Job Applications",
    description: "Apply to curated, pre-screened opportunities in seconds with one-click resume downloads.",
    accent: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: Trophy,
    title: "Higher Placement Rate",
    description: "Candidates using ClouVR see significantly better callback rates from top recruiters.",
    accent: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

function HomePage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader onLoginClick={() => setShowLogin(true)} />

      {/* HERO */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white">
          {/* background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-white" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Trusted by 1,000+ job seekers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Get High Paying Jobs{" "}
              <span className="text-amber-300">Faster</span>
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              ATS-optimized resumes, curated job assignments, and a streamlined
              application process — all in one place.
            </p>

            <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-gray-900 font-bold text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why ClouVR?
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              We handle the resume game so you can focus on nailing your interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, description, accent, iconColor }) => (
              <div
                key={title}
                className="card p-8 flex flex-col items-start gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`p-3 rounded-xl ${accent}`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="bg-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to land your next role?
            </h2>
            <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
              Join thousands of candidates and let ClouVR put you in front of the right recruiters.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-indigo-700 font-bold text-base px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              Login / Sign Up
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* LOGIN MODAL */}
      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <CandidateLoginPage onSuccess={() => setShowLogin(false)} />
        </Modal>
      )}
    </div>
  );
}

export default HomePage;
