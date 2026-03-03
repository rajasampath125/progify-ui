import { useState } from "react";
import PublicHeader from "../components/PublicHeader";
import Modal from "../components/Modal";
import CandidateLoginPage from "./CandidateLoginPage";
import Footer from "../components/layout/Footer";
import {
  ArrowRight, FileText, Trophy, Zap,
  CheckCircle, Users, Star, Shield, TrendingUp, Briefcase, Clock
} from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "ATS-Optimized Resumes",
    description: "Recruiter-crafted resumes engineered to beat ATS filters and land you in front of hiring managers faster.",
    grad: "from-indigo-500 to-violet-600",
    glow: "shadow-indigo-100",
  },
  {
    icon: Zap,
    title: "Curated Job Assignments",
    description: "Jobs are sourced and assigned to you by our recruiters — no endless job board scrolling required.",
    grad: "from-amber-400 to-orange-500",
    glow: "shadow-amber-100",
  },
  {
    icon: Trophy,
    title: "Higher Placement Rate",
    description: "Candidates using ClouVR see significantly better callback rates and faster offer timelines.",
    grad: "from-emerald-400 to-teal-600",
    glow: "shadow-emerald-100",
  },
];

const STATS = [
  { value: "1,000+", label: "Job Seekers", icon: Users },
  { value: "94%", label: "Placement Rate", icon: TrendingUp },
  { value: "3×", label: "Faster Callbacks", icon: Clock },
  { value: "500+", label: "Jobs Sourced", icon: Briefcase },
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    role: "Software Engineer",
    text: "Got 3 interviews in my first week. ClouVR's resume just works!",
    rating: 5,
  },
  {
    name: "Marcus T.",
    role: "Product Manager",
    text: "The ATS optimization alone was worth it. Companies actually called back.",
    rating: 5,
  },
  {
    name: "Ayesha K.",
    role: "Data Analyst",
    text: "Jobs came to me — I just applied. Couldn't have been simpler.",
    rating: 5,
  },
];

function HomePage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader onLoginClick={() => setShowLogin(true)} />

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8 text-indigo-200">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Trusted by 1,000+ job seekers worldwide
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Land High-Paying Jobs{" "}
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                Faster
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              ATS-optimized resumes, recruiter-sourced job assignments, and a
              streamlined application process — all managed for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-gray-900 font-bold text-base px-8 py-3.5 rounded-full shadow-2xl shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5"
              >
                Login to Your Account
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Trust chips */}
            <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
              {[
                { icon: Shield, text: "Invite-only access" },
                { icon: CheckCircle, text: "No job board needed" },
                { icon: Star, text: "5-star rated" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS BAR ──────────────────────────────────────────────── */}
        <section className="bg-slate-900 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map(({ value, label, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-900/60 border border-indigo-700/40 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
                  <p className="text-sm text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Managed for you, start to finish
              </h2>
              <p className="mt-4 text-slate-500 max-w-xl mx-auto">
                No job boards, no cold applying. Our recruiters handle job sourcing — you just focus on applying.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: "01", title: "Reach Out for Access", desc: "Contact our team to request candidate access. Approved users get a platform invite." },
                { step: "02", title: "We Source Your Jobs", desc: "Our recruiters curate and assign relevant job openings directly to your account." },
                { step: "03", title: "Apply with One Click", desc: "Review your assigned jobs and submit your ATS-optimized resume instantly." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-200 mb-6">
                    {step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────────────── */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Why ClouVR?</p>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Everything you need to{" "}
                <span className="text-indigo-600">get hired</span>
              </h2>
              <p className="mt-4 text-slate-500 max-w-xl mx-auto leading-relaxed">
                We handle the resume game so you can focus on nailing your interviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURES.map(({ icon: Icon, title, description, grad, glow }) => (
                <div
                  key={title}
                  className={`bg-white rounded-2xl p-8 shadow-lg ${glow} border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">Testimonials</p>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Loved by candidates</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map(({ name, role, text, rating }) => (
                <div key={name} className="bg-white rounded-2xl p-7 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                      {name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{name}</p>
                      <p className="text-slate-400 text-xs">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ─────────────────────────────────────────────── */}
        <section className="py-24 bg-gradient-to-br from-indigo-600 to-violet-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-extrabold text-white mb-5 tracking-tight">
              Ready to land your next role?
            </h2>
            <p className="text-indigo-200 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Already have access? Log in and check your assigned jobs today.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-indigo-700 font-bold text-base px-8 py-3.5 rounded-full shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Login to Your Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <CandidateLoginPage onSuccess={() => setShowLogin(false)} />
        </Modal>
      )}
    </div>
  );
}

export default HomePage;
