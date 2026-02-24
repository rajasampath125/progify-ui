import { useEffect, useState } from "react";
import { getCandidateSummary, getCurrentCandidate } from "../../api/candidateApi";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  History,
} from "lucide-react";

/* =====================
   SKELETON LOADER
===================== */
function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-10">
        <div className="skeleton h-7 w-56 mb-2" />
        <div className="skeleton h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-card">
            <div className="skeleton h-4 w-28 mb-4" />
            <div className="skeleton h-10 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================
   METRIC CARD
===================== */
function MetricCard({ title, value, icon: Icon, accent }) {
  return (
    <div className={`stat-card relative overflow-hidden animate-slide-up`}>
      {/* colored left accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${accent} rounded-l-2xl`} />
      <div className="flex items-start justify-between pl-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${accent.replace(/-(\d+)$/, "-100")}`}>
          <Icon className={`w-6 h-6 ${accent.replace("bg-", "text-")}`} />
        </div>
      </div>
    </div>
  );
}

/* =====================
   ACTION LINK CARD
===================== */
function ActionLink({ to, title, description, icon: Icon, accent }) {
  return (
    <Link
      to={to}
      className="group card p-6 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 no-underline"
    >
      <div className={`p-3 rounded-xl ${accent} shrink-0`}>
        <Icon className={`w-5 h-5 ${accent.replace("bg-", "text-").replace("-100", "-700")}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all mt-1 shrink-0" />
    </Link>
  );
}

/* =====================
   PAGE
===================== */
const CandidateDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getCandidateSummary()
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Failed to load candidate summary", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getCurrentCandidate()
      .then((res) => setProfile(res.data))
      .catch(() => { });
  }, []);

  if (loading || !summary) return <DashboardSkeleton />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      {/* PAGE HEADER */}
      <div className="mb-10">
        <h1 className="page-header">Candidate Dashboard</h1>
        <p className="page-subheader">
          Welcome back,{" "}
          <span className="font-semibold text-indigo-600">
            {profile?.name || "there"}
          </span>
          ! Here's your activity summary.
        </p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        <MetricCard
          title="Assigned Jobs"
          value={summary.totalAssigned}
          icon={Briefcase}
          accent="bg-indigo-600"
        />
        <MetricCard
          title="Applied Jobs"
          value={summary.totalApplied}
          icon={CheckCircle2}
          accent="bg-emerald-600"
        />
        <MetricCard
          title="Pending Applications"
          value={summary.totalNotApplied}
          icon={Clock}
          accent="bg-amber-500"
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionLink
            to="/candidate/jobs"
            title="Available Jobs"
            description="View assigned jobs and apply for open positions"
            icon={Briefcase}
            accent="bg-indigo-100"
          />
          <ActionLink
            to="/candidate/jobs/history"
            title="Job History"
            description="Review your entire job application history"
            icon={History}
            accent="bg-emerald-100"
          />
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboardPage;
