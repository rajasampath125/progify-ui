import { useEffect, useState, useRef } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import {
    getAdminSummary,
    getAdminJobAssignmentAnalytics,
    getAllUsers,
} from "../../api/adminApi";

import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Briefcase,
    FileCheck,
    FileX,
    Database,
    Calendar as CalendarIcon,
    User,
    Users,
    Filter,
    X,
    Activity,
    AlertTriangle
} from "lucide-react";


const COLORS = ["#2563eb", "#22c55e", "#ef4444", "#f59e0b"];

const AdminAnalyticsDashboardPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState(null);
    const [jobAssignments, setJobAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const today = new Date().toISOString().split("T")[0];
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        from: searchParams.get("from") || "",
        to: searchParams.get("to") || "",
        candidateId: searchParams.get("candidateId") || "",
        recruiterId: searchParams.get("recruiterId") || "",
    });

    // Combobox state
    const [recruiterSearch, setRecruiterSearch] = useState("");
    const [candidateSearch, setCandidateSearch] = useState("");
    const [recruiterComboOpen, setRecruiterComboOpen] = useState(false);
    const [candidateComboOpen, setCandidateComboOpen] = useState(false);
    const recruiterComboRef = useRef(null);
    const candidateComboRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (recruiterComboRef.current && !recruiterComboRef.current.contains(e.target)) setRecruiterComboOpen(false);
            if (candidateComboRef.current && !candidateComboRef.current.contains(e.target)) setCandidateComboOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* ======================
       INITIAL LOAD
    ====================== */
    useEffect(() => {
        setLoading(true);
        setError("");

        Promise.all([
            getAdminSummary(),
            getAdminJobAssignmentAnalytics(filters.from, filters.to, filters.candidateId, filters.recruiterId),
            getAllUsers(),
        ])
            .then(([summaryRes, jobsRes, usersRes]) => {
                setSummary(summaryRes.data);
                setJobAssignments(jobsRes.data || []);
                setUsers(usersRes.data || []);
            })
            .catch((err) => {
                console.error("Dashboard Load Error:", err);
                if (!err.response) {
                    setError("Network Error: Backend server is unreachable.");
                } else {
                    setError("Failed to load dashboard data.");
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const candidates = users.filter((u) => u.role === "CANDIDATE");
    const recruiters = users.filter((u) => u.role === "RECRUITER");

    // Initialize search names if URL had IDs on load
    useEffect(() => {
        if (users.length > 0) {
            if (filters.candidateId && !candidateSearch) {
                const c = candidates.find(x => x.id === filters.candidateId);
                if (c) setCandidateSearch(c.name && c.name !== "null" ? c.name : c.email);
            }
            if (filters.recruiterId && !recruiterSearch) {
                const r = recruiters.find(x => x.id === filters.recruiterId);
                if (r) setRecruiterSearch(r.name && r.name !== "null" ? r.name : r.email);
            }
        }
    }, [users, filters.candidateId, filters.recruiterId]);

    const filteredRecruiters = recruiters.filter(r => {
        const q = recruiterSearch.toLowerCase();
        return (r.name || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
    });

    const filteredCandidates = candidates.filter(c => {
        const q = candidateSearch.toLowerCase();
        return (c.name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
    });

    /* ======================
       DERIVED METRICS
    ====================== */

    const jobsPerDay = Object.values(
        jobAssignments.reduce((acc, r) => {
            acc[r.date] = acc[r.date] || { date: r.date, jobs: 0 };
            acc[r.date].jobs += r.jobsAssigned;
            return acc;
        }, {})
    );

    const applicationBreakdown = [
        {
            name: "Applied",
            value: jobAssignments.reduce((s, r) => s + r.applied, 0),
        },
        {
            name: "Not Applied",
            value: jobAssignments.reduce((s, r) => s + r.notApplied, 0),
        },
    ];

    const totalJobs = jobAssignments.reduce((s, r) => s + r.jobsAssigned, 0);
    const totalApplied = jobAssignments.reduce((s, r) => s + r.applied, 0);
    const totalNotApplied = jobAssignments.reduce((s, r) => s + r.notApplied, 0);


    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
                    Admin Analytics
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    System-wide trends and performance overview
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                        <p className="text-sm font-bold text-red-800">Connection Failed</p>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* FILTER BAR */}
            <div className="bg-white border ring-1 ring-gray-900/5 shadow-sm rounded-xl p-4 md:p-5 mb-6">

                {/* ── Quick presets row ── */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Range</span>
                    {[
                        { label: "Today", days: 0 },
                        { label: "7 Days", days: 7 },
                        { label: "30 Days", days: 30 },
                    ].map(({ label, days }) => {
                        const applyPreset = () => {
                            const to = today;
                            const from = days === 0 ? today : new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
                            setFilters(f => ({ ...f, from, to }));
                        };
                        const isActive = days === 0
                            ? filters.from === today && filters.to === today
                            : filters.to === today && filters.from === new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
                        return (
                            <button
                                key={label}
                                onClick={applyPreset}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors border ${isActive ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                            >
                                {label}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setFilters(f => ({ ...f, _customOpen: !f._customOpen }))}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors border flex items-center gap-1 ${filters._customOpen ? "bg-indigo-50 text-indigo-700 border-indigo-300" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                    >
                        <CalendarIcon className="w-3 h-3" />
                        Custom Range
                    </button>
                    {(filters.from || filters.to) && (
                        <span className="text-xs text-gray-500 ml-1">
                            {filters.from} → {filters.to || "now"}
                        </span>
                    )}
                </div>

                {/* ── Custom date range (collapsible) ── */}
                {filters._customOpen && (
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                            <input
                                type="date" max={today}
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                value={filters.from}
                                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                            <input
                                type="date" min={filters.from || undefined} max={today}
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                value={filters.to}
                                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* ── Dropdowns + actions row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Recruiter</label>
                        <div className="relative" ref={recruiterComboRef}>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="All Recruiters"
                                    value={recruiterSearch}
                                    onChange={(e) => {
                                        setRecruiterSearch(e.target.value);
                                        setRecruiterComboOpen(true);
                                        if (!e.target.value) setFilters(f => ({ ...f, recruiterId: "" }));
                                    }}
                                    onFocus={() => setRecruiterComboOpen(true)}
                                    className={`block w-full rounded-md border-0 py-1.5 pl-9 pr-9 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white ${filters.recruiterId ? "ring-indigo-300 bg-indigo-50" : "ring-gray-300"}`}
                                />
                                {recruiterSearch && (
                                    <button onClick={() => { setRecruiterSearch(""); setFilters(f => ({ ...f, recruiterId: "" })); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                            {recruiterComboOpen && filteredRecruiters.length > 0 && (
                                <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 text-sm">
                                    {filteredRecruiters.slice(0, 50).map((r) => (
                                        <li key={r.id} onClick={() => { setFilters(f => ({ ...f, recruiterId: r.id })); setRecruiterSearch(r.name && r.name !== "null" ? r.name : r.email); setRecruiterComboOpen(false); }} className={`cursor-pointer px-3 py-2 hover:bg-indigo-50 truncate ${r.id === filters.recruiterId ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-900"}`}>
                                            {r.name && r.name !== "null" ? `${r.name} (${r.email})` : r.email}
                                        </li>
                                    ))}
                                    {filteredRecruiters.length > 50 && <li className="px-3 py-1 text-xs text-gray-400 text-center border-t">Showing top 50 matches...</li>}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Candidate</label>
                        <div className="relative" ref={candidateComboRef}>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="All Candidates"
                                    value={candidateSearch}
                                    onChange={(e) => {
                                        setCandidateSearch(e.target.value);
                                        setCandidateComboOpen(true);
                                        if (!e.target.value) setFilters(f => ({ ...f, candidateId: "" }));
                                    }}
                                    onFocus={() => setCandidateComboOpen(true)}
                                    className={`block w-full rounded-md border-0 py-1.5 pl-9 pr-9 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white ${filters.candidateId ? "ring-indigo-300 bg-indigo-50" : "ring-gray-300"}`}
                                />
                                {candidateSearch && (
                                    <button onClick={() => { setCandidateSearch(""); setFilters(f => ({ ...f, candidateId: "" })); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                            {candidateComboOpen && filteredCandidates.length > 0 && (
                                <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 text-sm">
                                    {filteredCandidates.slice(0, 50).map((c) => (
                                        <li key={c.id} onClick={() => { setFilters(f => ({ ...f, candidateId: c.id })); setCandidateSearch(c.name && c.name !== "null" ? c.name : c.email); setCandidateComboOpen(false); }} className={`cursor-pointer px-3 py-2 hover:bg-indigo-50 truncate ${c.id === filters.candidateId ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-900"}`}>
                                            {c.name && c.name !== "null" ? `${c.name} (${c.email})` : c.email}
                                        </li>
                                    ))}
                                    {filteredCandidates.length > 50 && <li className="px-3 py-1 text-xs text-gray-400 text-center border-t">Showing top 50 matches...</li>}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (filters.from && filters.to && filters.from > filters.to) {
                                    setError("From date cannot be after To date"); return;
                                }
                                setError("");
                                setLoading(true);
                                setSearchParams({
                                    ...(filters.from && { from: filters.from }),
                                    ...(filters.to && { to: filters.to }),
                                    ...(filters.candidateId && { candidateId: filters.candidateId }),
                                    ...(filters.recruiterId && { recruiterId: filters.recruiterId }),
                                });
                                getAdminJobAssignmentAnalytics(filters.from, filters.to, filters.candidateId, filters.recruiterId)
                                    .then((res) => setJobAssignments(res.data || []))
                                    .finally(() => setLoading(false));
                            }}
                            className="flex-1 bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-indigo-500 shadow-sm transition-colors"
                        >
                            Apply
                        </button>
                        <button
                            onClick={() => {
                                setFilters({ from: "", to: "", candidateId: "", recruiterId: "", _customOpen: false });
                                setCandidateSearch("");
                                setRecruiterSearch("");
                                setError("");
                                setSearchParams({});
                                setLoading(true);
                                getAdminJobAssignmentAnalytics()
                                    .then((res) => setJobAssignments(res.data || []))
                                    .finally(() => setLoading(false));
                            }}
                            className="inline-flex items-center justify-center bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                            title="Clear Filters"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {!loading && jobAssignments.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-12 text-center flex flex-col items-center justify-center mb-6">
                    <Activity className="w-8 h-8 text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-900">No Analytics Data</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting the filters to find records</p>
                </div>
            )}

            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
                    <p className="text-sm text-red-600 font-medium">
                        {error}
                    </p>
                </div>
            )}

            {/* KPI CARDS */}
            {jobAssignments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KpiCard
                        title="Jobs Assigned"
                        value={totalJobs}
                        icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
                        trend="+12%"
                        colorClass="bg-indigo-50"
                    />
                    <KpiCard
                        title="Applied"
                        value={totalApplied}
                        icon={<FileCheck className="w-5 h-5 text-green-600" />}
                        trend="+5%"
                        colorClass="bg-green-50"
                    />
                    <KpiCard
                        title="Not Applied"
                        value={totalNotApplied}
                        icon={<FileX className="w-5 h-5 text-amber-600" />}
                        trend="-2%"
                        colorClass="bg-amber-50"
                    />
                    <KpiCard
                        title="Records"
                        value={jobAssignments.length}
                        icon={<Database className="w-5 h-5 text-blue-600" />}
                        colorClass="bg-blue-50"
                    />
                </div>
            )}



            {/* CHARTS */}
            {jobAssignments.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* JOBS PER DAY */}
                    <ChartCard title="Jobs Created Per Day" subtitle="Daily breakdown of job assignments">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={jobsPerDay} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="jobs"
                                    fill="#4f46e5" /* indigo-600 */
                                    radius={[4, 4, 0, 0]}
                                    cursor="pointer"
                                    onClick={(d) =>
                                        navigate(
                                            `/admin/job-assignments?from=${d.date}&to=${d.date}`
                                        )
                                    }
                                />
                            </BarChart>
                        </ResponsiveContainer>

                    </ChartCard>

                    {/* APPLICATION STATUS */}
                    <ChartCard title="Application Status" subtitle="Overview of candidate engagement">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={applicationBreakdown}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    label={({ name, value }) => `${name} (${value})`}
                                    labelLine={false}
                                >
                                    <Cell fill="#4f46e5" /> {/* indigo-600 */}
                                    <Cell fill="#e5e7eb" /> {/* gray-200 */}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                                Applied
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-gray-200 rounded-full"></span>
                                Not Applied
                            </span>
                        </div>

                    </ChartCard>
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center h-48 bg-white/50 rounded-xl backdrop-blur-sm shadow-sm ring-1 ring-gray-900/5 mt-6">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-3 mt-4 text-sm text-gray-500 font-medium">Loading analytics…</span>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ======================
   UI HELPERS
====================== */

const KpiCard = ({ title, value, icon, trend, colorClass }) => (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <p className={`text-xs font-semibold mt-2 ${trend.startsWith('+') ? 'text-green-600' : 'text-amber-600'}`}>
                        {trend} <span className="text-gray-400 font-normal">vs last month</span>
                    </p>
                )}
            </div>
            <div className={`p-2.5 rounded-lg ${colorClass}`}>
                {icon}
            </div>
        </div>
    </div>
);

const ChartCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
        <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {children}
    </div>
);

export default AdminAnalyticsDashboardPage;

