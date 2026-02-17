import { useEffect, useState } from "react";
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
} from "../../api/adminApi";

import { useSearchParams, useNavigate } from "react-router-dom";


const COLORS = ["#2563eb", "#22c55e", "#ef4444", "#f59e0b"];

const AdminAnalyticsDashboardPage = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [jobAssignments, setJobAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const today = new Date().toISOString().split("T")[0];
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        from: "",
        to: "",
    });



    /* ======================
       INITIAL LOAD
    ====================== */
    useEffect(() => {
        setLoading(true);

        Promise.all([
            getAdminSummary(),
            getAdminJobAssignmentAnalytics(),
        ])
            .then(([summaryRes, jobsRes]) => {
                setSummary(summaryRes.data);
                setJobAssignments(jobsRes.data || []);
            })
            .finally(() => setLoading(false));
    }, []);

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
                <h1 className="text-2xl font-semibold">Admin Analytics</h1>
                <p className="text-sm text-gray-500">
                    System-wide trends and performance overview
                </p>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white border rounded-xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs text-gray-500">From</label>
                        <input
                            type="date"
                            max={today}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            value={filters.from}
                            onChange={(e) =>
                                setFilters({ ...filters, from: e.target.value })
                            }
                        />


                    </div>

                    <div>
                        <label className="text-xs text-gray-500">To</label>
                        <input
                            type="date"
                            min={filters.from || undefined}
                            max={today}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            value={filters.to}
                            onChange={(e) =>
                                setFilters({ ...filters, to: e.target.value })
                            }
                        />

                    </div>

                    <button
                        onClick={() => {
                            if (filters.from && filters.to && filters.from > filters.to) {
                                setError("From date cannot be after To date");
                                return;
                            }

                            setError("");
                            setLoading(true);

                            setSearchParams({
                                ...(filters.from && { from: filters.from }),
                                ...(filters.to && { to: filters.to }),
                            });

                            getAdminJobAssignmentAnalytics(filters.from, filters.to)
                                .then((res) => setJobAssignments(res.data || []))
                                .finally(() => setLoading(false));
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                        Apply
                    </button>

                    <button
                        onClick={() => {
                            setFilters({ from: "", to: "" });
                            setError("");
                            setSearchParams({});
                            setLoading(true);

                            getAdminJobAssignmentAnalytics()
                                .then((res) => setJobAssignments(res.data || []))
                                .finally(() => setLoading(false));
                        }}
                        className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {!loading && jobAssignments.length === 0 && (
                <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
                    No analytics data available for the selected period
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600 mb-4">
                    {error}
                </p>
            )}

            {/* KPI CARDS */}
            {jobAssignments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <KpiCard title="Jobs Assigned" value={totalJobs} />
                    <KpiCard title="Applied" value={totalApplied} />
                    <KpiCard title="Not Applied" value={totalNotApplied} />
                    <KpiCard title="Records" value={jobAssignments.length} />
                </div>
            )}



            {/* CHARTS */}
            {jobAssignments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* JOBS PER DAY */}
                    <ChartCard title="Jobs Created Per Day">
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={jobsPerDay}>
                                <XAxis
                                    dataKey="date"
                                    label={{ value: "Date", position: "insideBottom", offset: -5 }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    label={{ value: "Jobs Assigned", angle: -90, position: "insideLeft" }}
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="jobs"
                                    fill="#2563eb"
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
                    <ChartCard title="Application Status">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={applicationBreakdown}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={90}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    <Cell fill="#2563eb" /> {/* Applied */}
                                    <Cell fill="#22c55e" /> {/* Not Applied */}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="flex gap-4 mt-4 text-sm">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                                Applied
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                                Not Applied
                            </span>
                        </div>

                    </ChartCard>
                </div>
            )}

            {loading && (
                <p className="text-center text-gray-400 mt-6">
                    Loading analytics…
                </p>
            )}
        </div>
    );
};

/* ======================
   UI HELPERS
====================== */

const KpiCard = ({ title, value }) => (
    <div className="bg-white rounded-xl shadow p-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-sm font-semibold mb-3">{title}</h3>
        {children}
    </div>
);

export default AdminAnalyticsDashboardPage;
