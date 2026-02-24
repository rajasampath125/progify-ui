import { useEffect, useState } from "react";
import { getAdminSummary } from "../../api/adminApi";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Zap,
  FileText,
  FileCheck,
  FileClock,
  ArrowRight,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Tag,
} from "lucide-react";

/* =====================
   METRIC CARD
===================== */
const MetricCard = ({ title, value, icon: Icon, accent, bgAccent, onClick }) => (
  <div
    onClick={onClick}
    className={`stat-card relative overflow-hidden animate-slide-up ${onClick ? "cursor-pointer" : "cursor-default"}`}
  >
    <div className={`absolute left-0 top-0 h-full w-1 ${accent} rounded-l-2xl`} />
    <div className="flex items-start justify-between pl-3">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-2 text-4xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bgAccent}`}>
        <Icon className={`w-6 h-6 ${accent.replace("bg-", "text-")}`} />
      </div>
    </div>
  </div>
);

/* =====================
   ACTION CARD
===================== */
const ActionCard = ({ title, description, icon: Icon, accent, bgAccent, onClick }) => (
  <div
    onClick={onClick}
    className="group card p-6 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
  >
    <div className={`p-3 rounded-xl ${bgAccent} shrink-0`}>
      <Icon className={`w-5 h-5 ${accent.replace("bg-", "text-")}`} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all mt-1 shrink-0" />
  </div>
);

/* =====================
   PAGE
===================== */
const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSummary()
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
        <div className="mb-10">
          <div className="skeleton h-7 w-56 mb-2" />
          <div className="skeleton h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton h-4 w-28 mb-4" />
              <div className="skeleton h-10 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      {/* PAGE HEADER */}
      <div className="mb-10">
        <h1 className="page-header">Admin Dashboard</h1>
        <p className="page-subheader">System-wide overview and quick management actions.</p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        <MetricCard
          title="Total Users"
          value={summary.totalUsers}
          icon={Users}
          accent="bg-indigo-600"
          bgAccent="bg-indigo-100"
          onClick={() => navigate("/admin/users")}
        />
        <MetricCard
          title="Active Users"
          value={summary.activeUsers}
          icon={UserCheck}
          accent="bg-emerald-600"
          bgAccent="bg-emerald-100"
          onClick={() => navigate("/admin/users?status=ACTIVE")}
        />
        <MetricCard
          title="Inactive Users"
          value={summary.inactiveUsers}
          icon={UserX}
          accent="bg-red-500"
          bgAccent="bg-red-100"
          onClick={() => navigate("/admin/users?status=INACTIVE")}
        />
        <MetricCard
          title="Total Jobs"
          value={summary.totalJobs}
          icon={Briefcase}
          accent="bg-violet-600"
          bgAccent="bg-violet-100"
          onClick={() => navigate("/admin/jobs")}
        />
        <MetricCard
          title="Active Jobs"
          value={summary.activeJobs}
          icon={Zap}
          accent="bg-amber-500"
          bgAccent="bg-amber-100"
          onClick={() => navigate("/admin/jobs?status=ACTIVE")}
        />
        <MetricCard
          title="Total Resumes"
          value={summary?.totalResumes ?? 0}
          icon={FileText}
          accent="bg-sky-600"
          bgAccent="bg-sky-100"
        />
        <MetricCard
          title="Active Resumes"
          value={summary?.activeResumes ?? 0}
          icon={FileCheck}
          accent="bg-teal-600"
          bgAccent="bg-teal-100"
        />
        <MetricCard
          title="Expired Resumes"
          value={summary?.expiredResumes ?? 0}
          icon={FileClock}
          accent="bg-gray-500"
          bgAccent="bg-gray-100"
        />
      </div>

      {/* QUICK ACTIONS */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionCard
          title="User Management"
          description="Create users, assign roles, manage access"
          icon={Users}
          accent="bg-indigo-600"
          bgAccent="bg-indigo-100"
          onClick={() => navigate("/admin/users")}
        />
        <ActionCard
          title="Job Management"
          description="View and control all job postings"
          icon={Briefcase}
          accent="bg-violet-600"
          bgAccent="bg-violet-100"
          onClick={() => navigate("/admin/jobs")}
        />
        <ActionCard
          title="Create Job"
          description="Create and assign jobs to candidates"
          icon={PlusCircle}
          accent="bg-emerald-600"
          bgAccent="bg-emerald-100"
          onClick={() => navigate("/admin/jobs/create")}
        />
        <ActionCard
          title="Category Management"
          description="Manage job categories"
          icon={Tag}
          accent="bg-amber-500"
          bgAccent="bg-amber-100"
          onClick={() => navigate("/admin/categories")}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;