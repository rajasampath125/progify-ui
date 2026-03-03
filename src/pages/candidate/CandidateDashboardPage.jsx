import { useEffect, useState } from "react";
import { getCandidateSummary, getCurrentCandidate } from "../../api/candidateApi";
import { Link } from "react-router-dom";
import {
  Briefcase, CheckCircle2, Clock, ArrowRight, History,
  Sparkles, TrendingUp,
} from "lucide-react";

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ title, value, icon: Icon, grad, desc }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${grad}`}>
      <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-5 -right-5 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-4xl font-extrabold tracking-tight mb-1">{value ?? "—"}</p>
        <p className="text-sm font-bold text-white/80">{title}</p>
        {desc && <p className="text-xs text-white/60 mt-1">{desc}</p>}
      </div>
    </div>
  );
}

// ── Action card ───────────────────────────────────────────────────────────────
function ActionLink({ to, title, description, icon: Icon, grad }) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors text-sm">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
    </Link>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ applied, total }) {
  const pct = total === 0 ? 0 : Math.round((applied / total) * 100);
  const color = pct >= 70 ? "from-emerald-400 to-teal-500" : pct >= 40 ? "from-amber-400 to-orange-500" : "from-indigo-400 to-violet-500";
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-slate-700">Application Rate</span>
        <span className={`font-bold ${pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-indigo-600"}`}>{pct}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1.5">{applied} of {total} jobs applied</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const CandidateDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getCandidateSummary().then(res => setSummary(res.data)).finally(() => setLoading(false));
    getCurrentCandidate().then(res => setProfile(res.data)).catch(() => { });
  }, []);

  if (loading || !summary) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="skeleton h-7 w-56 mb-2" />
          <div className="skeleton h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[0, 1, 2].map(i => <div key={i} className="h-36 rounded-2xl skeleton" />)}
        </div>
      </div>
    );
  }

  const firstName = profile?.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-10">

      {/* ── Welcome banner ───────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-7 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 right-20 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight mb-1">
              Good to see you, {firstName}! 👋
            </h1>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-xl">
              You have <strong className="text-white">{summary.totalNotApplied}</strong> pending job
              {summary.totalNotApplied !== 1 ? "s" : ""} to apply to. Keep going — you're doing great!
            </p>
          </div>
        </div>
      </div>

      {/* ── Metrics ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard title="Assigned Jobs" value={summary.totalAssigned} icon={Briefcase} grad="from-indigo-600 to-violet-700" />
        <MetricCard title="Applied Jobs" value={summary.totalApplied} icon={CheckCircle2} grad="from-emerald-500 to-teal-600" desc="Great work!" />
        <MetricCard title="Pending Applications" value={summary.totalNotApplied} icon={Clock} grad="from-amber-500 to-orange-500" desc="Don't miss these" />
      </div>

      {/* ── Progress bar ─────────────────────────────────────────── */}
      {summary.totalAssigned > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-700">Your Progress</h2>
          </div>
          <ProgressBar applied={summary.totalApplied} total={summary.totalAssigned} />
        </div>
      )}

      {/* ── Quick actions ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionLink
            to="/candidate/jobs"
            title="Available Jobs"
            description="View assigned jobs and apply for open positions"
            icon={Briefcase}
            grad="from-indigo-600 to-violet-600"
          />
          <ActionLink
            to="/candidate/jobs/history"
            title="Job History"
            description="Review your entire job application history"
            icon={History}
            grad="from-emerald-500 to-teal-600"
          />
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboardPage;
