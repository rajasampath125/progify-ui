import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRecruiterData } from "../../context/RecruiterDataContext";
import {
  BarChart2, Zap, Archive, PlusCircle, List,
  ArrowRight, User, AlertTriangle, Search,
  Briefcase, TrendingUp, Clock, CheckCircle2, XCircle,
} from "lucide-react";

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ title, value, icon: Icon, grad, sub }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${grad}`}>
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-4xl font-extrabold tracking-tight mb-1">{value}</p>
        <p className="text-sm font-semibold text-white/80">{title}</p>
        {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
function RatePill({ rate }) {
  const n = parseInt(rate, 10);
  const cls = n >= 70
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : n >= 40
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-red-50 text-red-700 ring-red-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${cls}`}>
      {rate}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const RecruiterDashboardPage = () => {
  const { jobs, jobCandidatesMap, loading, error, ensureLoaded } = useRecruiterData();
  const [candidateSearch, setCandidateSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => { ensureLoaded(); }, [ensureLoaded]);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.active).length;
  const inactiveJobs = totalJobs - activeJobs;

  const candidateSummaryArray = useMemo(() => {
    const acc = {};
    Object.values(jobCandidatesMap).forEach(candidates => {
      candidates.forEach(c => {
        const email = c.candidateEmail;
        if (!acc[email]) acc[email] = { assigned: 0, applied: 0 };
        acc[email].assigned += 1;
        if (c.applicationStatus === "APPLIED") acc[email].applied += 1;
      });
    });
    return Object.entries(acc).map(([email, s]) => ({
      email,
      assigned: s.assigned,
      applied: s.applied,
      pending: s.assigned - s.applied,
      rate: s.assigned === 0 ? "0%" : `${Math.round((s.applied / s.assigned) * 100)}%`,
    })).sort((a, b) => b.pending - a.pending);
  }, [jobCandidatesMap]);

  const actionableCandidates = useMemo(
    () => candidateSummaryArray.filter(c => c.pending > 0 && Number(c.rate.replace("%", "")) < 50).slice(0, 3),
    [candidateSummaryArray]
  );

  const [debouncedSearch, setDebouncedSearch] = useState(candidateSearch);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(candidateSearch), 300);
    return () => clearTimeout(t);
  }, [candidateSearch]);

  const filteredCandidates = useMemo(
    () => candidateSummaryArray.filter(c => c.email.toLowerCase().includes(debouncedSearch.toLowerCase())).slice(0, 50),
    [candidateSummaryArray, debouncedSearch]
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="skeleton h-7 w-56 mb-2" />
          <div className="skeleton h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[0, 1, 2].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-10">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruiter Dashboard</h1>
          <p className="mt-1 text-slate-500 text-sm">Overview of your job postings and candidate activity.</p>
        </div>
        <button
          onClick={() => navigate("/recruiter/jobs/create")}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" /> New Job
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Metric cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard title="Total Jobs" value={totalJobs} icon={Briefcase} grad="from-indigo-600 to-violet-700" />
        <MetricCard title="Active Jobs" value={activeJobs} icon={Zap} grad="from-emerald-500 to-teal-600" sub="Currently live" />
        <MetricCard title="Inactive Jobs" value={inactiveJobs} icon={Archive} grad="from-slate-600 to-slate-700" sub="Paused or closed" />
      </div>

      {/* ── Quick actions ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: "/recruiter/jobs/create", title: "Create Job", desc: "Post a new job and start assigning candidates", icon: PlusCircle, grad: "from-indigo-500 to-violet-600" },
            { href: "/recruiter/jobs", title: "Manage Jobs", desc: "View, activate, or deactivate your job postings", icon: List, grad: "from-emerald-500 to-teal-600" },
          ].map(({ href, title, desc, icon: Icon, grad }) => (
            <a
              key={href}
              href={href}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{title}</p>
                <p className="text-sm text-slate-500 mt-0.5 leading-tight">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* ── Action needed ─────────────────────────────────────────── */}
      {actionableCandidates.length > 0 && (
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Action Needed
            </h2>
            <span className="text-sm text-slate-400">— Candidates with low response</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionableCandidates.map(c => (
              <div key={c.email} className="bg-white border border-red-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-red-50 transition-all duration-200 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-rose-600 rounded-l-2xl" />
                <div className="pl-1">
                  <p className="font-semibold text-slate-800 truncate text-sm mb-3">{c.email}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full ring-1 ring-red-200">
                      {c.pending} Pending
                    </span>
                    <RatePill rate={c.rate} />
                  </div>
                  <button
                    onClick={() => navigate(`/recruiter/candidates/${encodeURIComponent(c.email)}/activity`)}
                    className="w-full text-center text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl py-2 transition-colors flex items-center justify-center gap-1.5"
                  >
                    View Activity <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Candidate pipeline table ──────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-slate-900">Candidate Pipeline</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by email..."
                value={candidateSearch}
                onChange={e => setCandidateSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-56 transition"
              />
            </div>
            <a href="/recruiter/analytics" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Analytics <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50">
                  {["Candidate", "Assigned", "Applied", "Pending", "Rate"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                      {candidateSummaryArray.length === 0 ? "No candidate data yet. Start assigning jobs!" : "No candidates match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map(c => (
                    <tr key={c.email} className="hover:bg-slate-50 transition-colors group">
                      <td
                        className="px-5 py-3.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer truncate max-w-[220px]"
                        onClick={() => navigate(`/recruiter/candidates/${encodeURIComponent(c.email)}/activity`)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                            {c.email[0].toUpperCase()}
                          </div>
                          <span className="truncate">{c.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">{c.assigned}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full ring-1 ring-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> {c.applied}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full ring-1 ring-amber-200">
                          <Clock className="w-3 h-3" /> {c.pending}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><RatePill rate={c.rate} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboardPage;
