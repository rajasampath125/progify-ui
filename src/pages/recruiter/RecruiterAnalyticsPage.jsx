/**
 * RecruiterAnalyticsPage
 *
 * Purpose:
 * - High-level performance overview for recruiters
 * - Answers "How am I doing?" not "Show me all jobs"
 *
 * Shows:
 * - Jobs created over time
 * - Candidate response behavior
 * - Application success rate
 *
 * Navigation:
 * - Drill-downs redirect to Jobs page for details
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  Calendar,
  Briefcase,
  Activity,
  RotateCcw
} from "lucide-react";
import {
  getDashboardSummary,
  getAssignmentAnalytics,
  getCandidatePipeline,
  getCandidateMetricsByCategory
} from "../../api/recruiterApi";

const RecruiterAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState({ totalJobs: 0 });
  const [assignmentData, setAssignmentData] = useState([]);
  const [pipelineData, setPipelineData] = useState([]);
  const [categoryMetrics, setCategoryMetrics] = useState([]);

  const [dateRange, setDateRange] = useState("30"); // ALL | 7 | 30
  const [selectedCandidate, setSelectedCandidate] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [candidateSearch, setCandidateSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const from = dateRange === "ALL" ? "1970-01-01" : new Date(Date.now() - Number(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const to = new Date().toISOString().split('T')[0];

      const [summaryRes, assignmentRes, pipelineRes, categoryRes] = await Promise.all([
        getDashboardSummary(),
        getAssignmentAnalytics({ from, to }),
        getCandidatePipeline(),
        getCandidateMetricsByCategory()
      ]);

      setSummary({ totalJobs: summaryRes.data.totalJobs || 0 });
      setAssignmentData(assignmentRes.data || []);
      setPipelineData(pipelineRes.data || []);
      setCategoryMetrics(categoryRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleBarClick = (data) => {
    console.log("BAR CLICK DATA:", data);
    if (!data || !data.date) return;
    navigate(`/recruiter/jobs?date=${data.date}`);
  };

  // Computed values from the optimized data
  const jobsToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return assignmentData
      .filter(a => a.date === today)
      .reduce((acc, curr) => acc + curr.jobsAssigned, 0);
  }, [assignmentData]);

  const jobsLast7Days = useMemo(() => {
    return assignmentData.reduce((acc, curr) => acc + curr.jobsAssigned, 0);
  }, [assignmentData]);

  const filteredPipeline = useMemo(() => {
    return pipelineData.filter(p => {
      if (selectedCandidate !== "ALL" && (p.email || p.candidateName) !== selectedCandidate) return false;
      // category filtering for pipeline is tricky if not in the DTO, 
      // but we can filter by candidateSearch here
      const email = (p.email || p.candidateName || "").toLowerCase();
      if (candidateSearch && !email.includes(candidateSearch.toLowerCase())) return false;
      return true;
    });
  }, [pipelineData, selectedCandidate, candidateSearch]);

  const applicationBreakdown = useMemo(() => {
    let applied = 0;
    let total = 0;

    // If a specific candidate is selected, we use their stats
    // Otherwise we sum up everything in the pipeline (which already respects the date filter on backend)
    filteredPipeline.forEach(p => {
      applied += (p.applied || 0);
      total += (p.assigned || 0);
    });

    return { applied, pending: total - applied };
  }, [filteredPipeline]);

  const jobsAssignedByDate = useMemo(() => {
    const map = {};
    assignmentData.forEach(a => {
      map[a.date] = (map[a.date] || 0) + a.jobsAssigned;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [assignmentData]);

  const candidateSummary = useMemo(() => {
    return filteredPipeline.map(p => {
      const assigned = p.assigned || 0;
      const applied = p.applied || 0;
      return {
        id: p.candidateId,
        name: p.candidateName || p.email || "",
        email: p.email || "",
        assigned,
        applied,
        pending: assigned - applied,
        rate: assigned === 0 ? "0%" : `${Math.round((applied / assigned) * 100)}%`
      }
    }).sort((a, b) => b.pending - a.pending);
  }, [filteredPipeline]);

  const actionableCandidates = useMemo(
    () => candidateSummary.filter(c => c.pending > 0 && Number(c.rate.replace("%", "")) < 50).slice(0, 3),
    [candidateSummary]
  );

  /* =========================
     METRICS
  ========================= */

  const renderPieLabel = ({ name, percent }) =>
    `${name} (${Math.round(percent * 100)}%)`;

  const totalAssigned = applicationBreakdown.applied + applicationBreakdown.pending;
  const applicationRateStr = totalAssigned === 0 ? "0%" : `${Math.round((applicationBreakdown.applied / totalAssigned) * 100)}%`;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="page-header">Recruiter Analytics</h1>
        <p className="page-subheader">Performance & reporting overview — job assignments, candidate response rates, and follow-up insights.</p>
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

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPI gradIndex={0} title="Total Jobs" value={summary.totalJobs} icon={<Briefcase className="w-5 h-5 text-white" />} />
        <KPI gradIndex={1} title="Jobs Today" value={jobsToday} icon={<Calendar className="w-5 h-5 text-white" />} />
        <KPI gradIndex={2} title="Jobs (Range)" value={jobsLast7Days} icon={<Activity className="w-5 h-5 text-white" />} />
        <KPI
          gradIndex={3}
          title="Application Rate"
          icon={<span title="Calculated as: (Total Applied Jobs ÷ Total Assigned Jobs) × 100" className="cursor-help text-white/80 font-bold w-5 h-5 flex items-center justify-center text-xs">i</span>}
          value={applicationRateStr}
        />
      </div>

      {/* FILTERS */}
      <div className="bg-white border ring-1 ring-gray-900/5 shadow-sm rounded-xl p-4 md:p-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* LEFT: Context filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="font-medium hidden sm:inline">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="ALL">All Categories</option>
              {categoryMetrics.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RIGHT: Global time filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium hidden sm:inline">Time Range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-40 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="ALL">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>

          <button
            onClick={() => {
              setDateRange("ALL");
              setSelectedCategory("ALL");
              setSelectedCandidate("ALL");
              setCandidateSearch("");
            }}
            className="inline-flex items-center justify-center gap-2 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 rounded-md transition-colors w-full sm:w-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-8 italic">
        Analytics are based on <strong>jobs assigned</strong>. Candidates appear only if they have at least one job.
      </p>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <ChartCard title="Jobs Assigned to Candidates (Daily)">
          {assignmentData.length === 0 && (
            <p className="text-sm text-gray-500">No data available yet</p>
          )}
          <p className="text-xs text-gray-500 mb-4 h-8">
            Total number of jobs <strong>assigned by you</strong> per day
            <br />
            <span className="italic">
              (Across all candidates · filtered by category & time range)
            </span>
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobsAssignedByDate}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  cursor="pointer"
                  onClick={(entry) => handleBarClick(entry)}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Application Status Overview">
          {/* Candidate filter INSIDE card */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              👤 Candidate (Application Status)
            </label>
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="ALL">All Candidates</option>
              {pipelineData.map((p) => (
                <option key={p.email} value={p.email}>
                  {p.candidateName || p.email}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-gray-500 mb-4 h-4">
            Candidate application progress
          </p>

          <div className="h-64 flex items-center justify-center">
            {applicationBreakdown.applied + applicationBreakdown.pending === 0 ? (
              <p className="mt-1 text-sm text-gray-500">
                No application activity for the selected filters.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Applied", value: applicationBreakdown.applied },
                      { name: "Pending", value: applicationBreakdown.pending },
                    ]}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={90}
                    label={renderPieLabel}
                    labelLine={false}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

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
          <p className="text-sm text-gray-500 mb-4">
            Candidates with multiple pending assignments and a low overall application rate. Consider following up with them.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionableCandidates.map((c) => (
              <div key={c.email} className="bg-white border border-red-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="font-semibold text-gray-900 truncate mb-1">{c.name}</div>
                <div className="flex justify-between text-sm text-gray-600 mb-4 mt-2">
                  <div className="bg-red-50 px-2.5 py-1 rounded-md text-red-700 font-medium text-xs border border-red-100">Pending: {c.pending}</div>
                  <div className="bg-gray-50 px-2.5 py-1 rounded-md text-gray-700 font-medium text-xs border border-gray-200">Rate: {c.rate}</div>
                </div>
                <button
                  onClick={() => navigate(`/recruiter/candidates/${c.id}/activity`)}
                  className="w-full text-center text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg py-2 transition-colors"
                >
                  Review Activity
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CANDIDATE PERFORMANCE SUMMARY */}
      <div>
        <h2 className="text-xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight mb-2">
          Candidate Performance Summary
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-3xl">
          Breakdown of how each candidate responded to jobs assigned by you.
          <br />
          Helps identify follow-ups, inactive candidates, and overall response quality.
        </p>

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
        <p className="text-xs text-gray-500 mb-3 italic">
          Sorted implicitly by engagement (high response → low response)
        </p>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {candidateSummary.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                      No candidates match the selected filters
                    </td>
                  </tr>
                )}

                {candidateSummary
                  .filter((c) =>
                    c.email.toLowerCase().includes(candidateSearch.toLowerCase())
                  )
                  .map((c) => (
                    <tr key={c.email} className="hover:bg-gray-50 transition-colors">
                      <td
                        className="whitespace-nowrap px-6 py-4 text-sm font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/recruiter/candidates/${c.id}/view`
                          )
                        }
                      >
                        {c.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{c.assigned}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {c.applied}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {c.pending}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${Number(c.rate.replace("%", "")) >= 75
                            ? "bg-green-100 text-green-800"
                            : Number(c.rate.replace("%", "")) >= 40
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {c.rate}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => navigate(`/recruiter/candidates/${c.id}/activity`)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View Activity
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   UI HELPERS
========================= */

const KPI_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-sky-500 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
];

const KPI = ({ title, value, icon, gradIndex = 0 }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${KPI_GRADIENTS[gradIndex % KPI_GRADIENTS.length]} p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>
    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white/80">{title}</p>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-4xl font-extrabold tracking-tight">{value}</p>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 flex flex-col">
    <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
    <div className="flex-grow flex flex-col">
      {children}
    </div>
  </div>
);

export default RecruiterAnalyticsPage;
