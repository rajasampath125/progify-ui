import { useEffect, useState } from "react";
import { getRecruiterJobs, getAllJobsCandidates } from "../../api/recruiterApi";
import { useNavigate } from "react-router-dom";
import {
  BarChart2,
  Zap,
  Archive,
  PlusCircle,
  List,
  ArrowRight,
  ExternalLink,
  User,
  AlertTriangle,
  Search,
} from "lucide-react";

/* =====================
   SKELETON
===================== */
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
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
function MetricCard({ title, value, icon: Icon, accent, bgAccent }) {
  return (
    <div className="stat-card relative overflow-hidden animate-slide-up">
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
}

/* =====================
   ACTION CARD
===================== */
function ActionCard({ href, title, description, icon: Icon, accent, bgAccent }) {
  return (
    <a
      href={href}
      className="group card p-6 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 no-underline"
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
    </a>
  );
}

/* =====================
   PAGE
===================== */
const RecruiterDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [jobCandidatesMap, setJobCandidatesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [jobsRes, candidatesRes] = await Promise.all([
          getRecruiterJobs(),
          getAllJobsCandidates()
        ]);
        setJobs(jobsRes.data || []);
        setJobCandidatesMap(candidatesRes.data || {});
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        if (!err.response) {
          setError("Network Error: Backend server is unreachable.");
        } else {
          setError("Failed to load recruiter dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.active).length;
  const inactiveJobs = totalJobs - activeJobs;

  const candidateSummary = Object.entries(jobCandidatesMap).reduce((acc, [jobId, candidates]) => {
    candidates.forEach((c) => {
      const email = c.candidateEmail;
      if (!acc[email]) acc[email] = { assigned: 0, applied: 0 };
      acc[email].assigned += 1;
      if (c.applicationStatus === "APPLIED") acc[email].applied += 1;
    });
    return acc;
  }, {});

  const candidateSummaryArray = Object.entries(candidateSummary).map(([email, stats]) => ({
    email,
    assigned: stats.assigned,
    applied: stats.applied,
    pending: stats.assigned - stats.applied,
    rate: stats.assigned === 0 ? "0%" : `${Math.round((stats.applied / stats.assigned) * 100)}%`,
  })).sort((a, b) => b.pending - a.pending);



  const actionableCandidates = candidateSummaryArray
    .filter((c) => c.pending > 0 && Number(c.rate.replace('%', '')) < 50)
    .slice(0, 3);

  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      {/* PAGE HEADER */}
      <div className="mb-10">
        <h1 className="page-header">Recruiter Dashboard</h1>
        <p className="page-subheader">Overview of your job postings and candidate activity.</p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        <MetricCard
          title="Total Jobs"
          value={totalJobs}
          icon={BarChart2}
          accent="bg-indigo-600"
          bgAccent="bg-indigo-100"
        />
        <MetricCard
          title="Active Jobs"
          value={activeJobs}
          icon={Zap}
          accent="bg-emerald-600"
          bgAccent="bg-emerald-100"
        />
        <MetricCard
          title="Inactive Jobs"
          value={inactiveJobs}
          icon={Archive}
          accent="bg-gray-500"
          bgAccent="bg-gray-100"
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCard
            href="/recruiter/jobs/create"
            title="Create Job"
            description="Post a new job and start assigning candidates"
            icon={PlusCircle}
            accent="bg-indigo-600"
            bgAccent="bg-indigo-100"
          />
          <ActionCard
            href="/recruiter/jobs"
            title="Manage Jobs"
            description="View, activate, or deactivate your existing job postings"
            icon={List}
            accent="bg-emerald-600"
            bgAccent="bg-emerald-100"
          />
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-800">Connection Failed</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* ACTION NEEDED SECTION */}
      {actionableCandidates.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Action Needed: Unresponsive Candidates
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionableCandidates.map((c) => (
              <div key={c.email} className="bg-white border border-red-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div>
                  <div className="font-semibold text-gray-900 truncate mb-1">{c.email}</div>
                  <div className="flex justify-between text-sm text-gray-600 mb-4 mt-2">
                    <div className="bg-red-50 px-2.5 py-1 rounded-md text-red-700 font-medium text-xs border border-red-100">Pending: {c.pending}</div>
                    <div className="bg-gray-50 px-2.5 py-1 rounded-md text-gray-700 font-medium text-xs border border-gray-200">Rate: {c.rate}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/recruiter/candidates/${encodeURIComponent(c.email)}/activity`)}
                  className="w-full text-center text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg py-2 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  View Activity
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CANDIDATE PERFORMANCE SUMMARY */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Candidate Pipeline Status</h2>
          <a href="/recruiter/analytics" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
            Full Analytics <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by candidate email..."
            value={candidateSearch}
            onChange={(e) => setCandidateSearch(e.target.value)}
            className="block w-full sm:w-80 rounded-md border-0 py-2 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs Assigned</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {candidateSummaryArray.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      No candidate data available yet. Start assigning jobs!
                    </td>
                  </tr>
                ) : (
                  candidateSummaryArray
                    .filter((c) => c.email.toLowerCase().includes(candidateSearch.toLowerCase()))
                    .map((c) => (
                      <tr key={c.email} className="hover:bg-gray-50 transition-colors">
                        <td
                          className="whitespace-nowrap px-6 py-4 text-sm font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer"
                          onClick={() => navigate(`/recruiter/candidates/${encodeURIComponent(c.email)}/activity`)}
                        >
                          {c.email}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{c.assigned}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {c.applied}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            {c.pending}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 font-semibold">{c.rate}</td>
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
