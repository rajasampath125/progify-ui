import { useEffect, useState } from "react";
import { getAdminSummary } from "../../api/adminApi";
import { useNavigate } from "react-router-dom";
import {
  Users, UserCheck, UserX, Briefcase, Zap,
  FileText, FileCheck, FileClock, ArrowRight,
  PlusCircle, Tag, BarChart2,
} from "lucide-react";

// ── Gradient metric card ──────────────────────────────────────────────────────
const METRIC_GRADIENTS = [
  "from-indigo-600 to-violet-700",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-red-600",
  "from-violet-600 to-purple-700",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-teal-500 to-cyan-600",
  "from-slate-600 to-slate-700",
];

const MetricCard = ({ title, value, icon: Icon, gradIdx = 0, onClick }) => {
  const grad = METRIC_GRADIENTS[gradIdx % METRIC_GRADIENTS.length];
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${grad} ${onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl" : ""} transition-all duration-200`}
    >
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-4xl font-extrabold tracking-tight mb-1">{value ?? "—"}</p>
        <p className="text-sm font-semibold text-white/80">{title}</p>
        {onClick && (
          <div className="mt-3 flex items-center gap-1 text-white/70 text-xs font-medium">
            View <ArrowRight className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Action card ───────────────────────────────────────────────────────────────
const ActionCard = ({ title, description, icon: Icon, grad, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-0.5 transition-all duration-200"
  >
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors text-sm">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSummary().then(res => setSummary(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="skeleton h-7 w-56 mb-2" />
          <div className="skeleton h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const METRICS = [
    { title: "Total Users", value: summary.totalUsers, icon: Users, gradIdx: 0, path: "/admin/users" },
    { title: "Active Users", value: summary.activeUsers, icon: UserCheck, gradIdx: 1, path: "/admin/users?status=ACTIVE" },
    { title: "Inactive Users", value: summary.inactiveUsers, icon: UserX, gradIdx: 2, path: "/admin/users?status=INACTIVE" },
    { title: "Total Jobs", value: summary.totalJobs, icon: Briefcase, gradIdx: 3, path: "/admin/jobs" },
    { title: "Active Jobs", value: summary.activeJobs, icon: Zap, gradIdx: 4, path: "/admin/jobs?status=ACTIVE" },
    { title: "Total Resumes", value: summary.totalResumes ?? 0, icon: FileText, gradIdx: 5 },
    { title: "Active Resumes", value: summary.activeResumes ?? 0, icon: FileCheck, gradIdx: 6 },
    { title: "Expired Resumes", value: summary.expiredResumes ?? 0, icon: FileClock, gradIdx: 7 },
  ];

  const ACTIONS = [
    { title: "User Management", description: "Create users, assign roles, manage access", icon: Users, grad: "from-indigo-500 to-violet-600", path: "/admin/users" },
    { title: "Job Management", description: "View and control all job postings", icon: Briefcase, grad: "from-violet-500 to-purple-600", path: "/admin/jobs" },
    { title: "Create Job", description: "Create and assign jobs to candidates", icon: PlusCircle, grad: "from-emerald-500 to-teal-600", path: "/admin/jobs/create" },
    { title: "Category Management", description: "Manage job categories and labels", icon: Tag, grad: "from-amber-500 to-orange-500", path: "/admin/categories" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-10">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-slate-500 text-sm">System-wide overview and quick management actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/analytics")}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
          <button
            onClick={() => navigate("/admin/jobs/create")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" /> New Job
          </button>
        </div>
      </div>

      {/* ── Metric cards ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">System Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {METRICS.map(({ title, value, icon, gradIdx, path }) => (
            <MetricCard
              key={title}
              title={title}
              value={value}
              icon={icon}
              gradIdx={gradIdx}
              onClick={path ? () => navigate(path) : undefined}
            />
          ))}
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTIONS.map(a => (
            <ActionCard key={a.title} {...a} onClick={() => navigate(a.path)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;