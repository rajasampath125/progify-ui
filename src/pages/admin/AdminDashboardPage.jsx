import { useEffect, useState } from "react";
import { getAdminSummary } from "../../api/adminApi";
import { useNavigate } from "react-router-dom";

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
      <div className="p-10 text-center text-gray-500">
        Loading dashboard metrics…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">
          System overview and quick actions
        </p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <MetricCard
          title="Total Users"
          value={summary.totalUsers}
          onClick={() => navigate("/admin/users")}
        />
        <MetricCard
          title="Active Users"
          value={summary.activeUsers}
          onClick={() =>
            navigate("/admin/users?status=ACTIVE")
          }
        />
        <MetricCard
          title="Inactive Users"
          value={summary.inactiveUsers}
          onClick={() =>
            navigate("/admin/users?status=INACTIVE")
          }
        />
        <MetricCard
          title="Total Jobs"
          value={summary.totalJobs}
          onClick={() => navigate("/admin/jobs")}
        />
        <MetricCard
          title="Active Jobs"
          value={summary.activeJobs}
          onClick={() =>
            navigate("/admin/jobs?status=ACTIVE")
          }
        />
        <MetricCard
          title="Total Resumes Uploaded"
          value={summary?.totalResumes || 0}
        />

        <MetricCard
          title="Active Resumes"
          value={summary?.activeResumes || 0}
        />

        <MetricCard
          title="Expired Resumes"
          value={summary?.expiredResumes || 0}
        />
      </div>

      {/* QUICK ACTIONS */}
      <h2 className="text-lg font-semibold mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <ActionCard
          title="User Management"
          description="Create users, assign roles, manage access"
          onClick={() => navigate("/admin/users")}
        />
        <ActionCard
          title="Job Management"
          description="View and control all job postings"
          onClick={() => navigate("/admin/jobs")}
        />
        <ActionCard
          title="Create Job"
          description="Create and assign jobs to candidates"
          onClick={() => navigate("/admin/jobs/create")}
        />
        <ActionCard
          title="Category Management"
          description="Manage job categories"
          onClick={() => navigate("/admin/categories")}
        />
      </div>
    </div>
  );
};

/* =======================
   METRIC CARD
======================= */
const MetricCard = ({ title, value, onClick, className = "" }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
      onClick ? "hover:border-blue-500" : ""
    } ${className}`}
  >
    <p className="text-sm text-gray-500">{title}</p>
    <p className="mt-2 text-3xl font-semibold text-gray-900">
      {value}
    </p>
  </div>
);

/* =======================
   ACTION CARD
======================= */
const ActionCard = ({ title, description, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md hover:border-blue-500"
  >
    <h3 className="font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-sm text-gray-500">
      {description}
    </p>
  </div>
);

export default AdminDashboardPage;