import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAdminJobAssignmentAnalytics } from "../../api/adminApi";
import { Search, X, ChevronLeft, ChevronRight, ArrowUpDown, AlertTriangle } from "lucide-react";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";

const AdminJobAssigmentReportPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = 10;
    const sortOrder = searchParams.get("sort") || "DESC";
    const recruiterFilter = searchParams.get("recruiter") || "";
    const candidateFilter = searchParams.get("candidate") || "";
    const fromParam = searchParams.get("from") || "";
    const toParam = searchParams.get("to") || "";

    const updateFilters = (updates) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        if (!updates.page) newParams.delete("page");
        setSearchParams(newParams);
    };

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");

        getAdminJobAssignmentAnalytics(fromParam || undefined, toParam || undefined)
            .then((res) => {
                setRows(res.data || []);
            })
            .catch((err) => {
                console.error("Analytics Error:", err);
                if (!err.response) {
                    setError("Network Error: Backend server is unreachable.");
                } else {
                    setError("Failed to load analytics data.");
                }
            })
            .finally(() => setLoading(false));
    }, [fromParam, toParam]);

    /* ======================
       FILTERED ROWS
    ====================== */
    const filteredRows = rows
        .filter((r) => {
            const rowDate = new Date(r.date);

            if (fromParam && rowDate < new Date(fromParam)) return false;
            if (toParam && rowDate > new Date(toParam)) return false;

            if (
                recruiterFilter &&
                !(r.recruiterName || "")
                    .toLowerCase()
                    .includes(recruiterFilter.toLowerCase())
            )
                return false;

            if (
                candidateFilter &&
                !(r.candidateName || "")
                    .toLowerCase()
                    .includes(candidateFilter.toLowerCase())
            )
                return false;

            return true;
        })
        .sort((a, b) => {
            const d1 = new Date(a.date);
            const d2 = new Date(b.date);
            return sortOrder === "DESC" ? d2 - d1 : d1 - d2;
        });


    const totalPages = Math.ceil(filteredRows.length / pageSize);

    const paginatedRows = filteredRows.slice(
        (page - 1) * pageSize,
        page * pageSize
    );


    /* ======================
       SUMMARY METRICS
    ====================== */
    const totalJobs = filteredRows.reduce((s, r) => s + r.jobsAssigned, 0);
    const totalApplied = filteredRows.reduce((s, r) => s + r.applied, 0);
    const totalNotApplied = filteredRows.reduce((s, r) => s + r.notApplied, 0);

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold mb-1">Job Assignment Report</h1>
            <p className="text-sm text-gray-500 mb-6">
                Day-wise jobs assigned per recruiter and candidate
            </p>
            {/* FILTERS */}
            <div className="bg-white border rounded-xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">

                    <div className="col-span-1">
                        <label className="text-xs text-gray-500">From</label>
                        <input
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            value={fromParam}
                            onChange={(e) => updateFilters({ from: e.target.value })}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-xs text-gray-500">To</label>
                        <input
                            type="date"
                            min={fromParam || undefined}
                            max={new Date().toISOString().split("T")[0]}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            value={toParam}
                            onChange={(e) => updateFilters({ to: e.target.value })}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-xs text-gray-500">Recruiter</label>
                        <input
                            placeholder="Name..."
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            value={recruiterFilter}
                            onChange={(e) => updateFilters({ recruiter: e.target.value })}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-xs text-gray-500">Candidate</label>
                        <input
                            placeholder="Email..."
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            value={candidateFilter}
                            onChange={(e) => updateFilters({ candidate: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={() => {
                            const today = new Date().toISOString().split("T")[0];
                            updateFilters({ from: today, to: today, page: "1" });
                        }}
                        className="btn-secondary w-full"
                    >
                        Today
                    </button>

                    <button
                        onClick={() => updateFilters({ page: "1" })}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </button>

                    <button
                        onClick={() => updateFilters({ from: "", to: "", recruiter: "", candidate: "", sort: "DESC", page: "1" })}
                        className="flex items-center justify-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </button>
                </div>
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

            {/* SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <SummaryCard title="Total Jobs" value={totalJobs} />
                <SummaryCard title="Applied" value={totalApplied} />
                <SummaryCard title="Not Applied" value={totalNotApplied} />
                <SummaryCard title="Records" value={filteredRows.length} />
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-200 text-left">
                        <tr>
                            <th
                                className="p-3 cursor-pointer select-none"
                                onClick={() => {
                                    const next = sortOrder === "DESC" ? "ASC" : "DESC";
                                    updateFilters({ sort: next, page: "1" });
                                }}
                            >
                                Date{" "}
                                <span className="text-xs text-grey-900">
                                    {sortOrder === "DESC" ? "↓" : "↑"}
                                </span>
                            </th>
                            <th className="p-3">Recruiter</th>
                            <th className="p-3">Candidate</th>
                            <th className="p-3">Jobs</th>
                            <th className="p-3">Applied</th>
                            <th className="p-3">Not Applied</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <TableSkeleton cols={6} rows={7} />
                                </td>
                            </tr>
                        ) : filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <EmptyState
                                        icon="search"
                                        title="No data found"
                                        description="Try adjusting your date range or filters."
                                    />
                                </td>
                            </tr>
                        ) : (
                            paginatedRows.map((r, idx) => (
                                <tr key={idx} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{r.date}</td>
                                    <td className="p-3 font-medium">{r.recruiterName}</td>
                                    <td className="p-3 text-blue-600">{r.candidateName}</td>
                                    <td className="p-3">{r.jobsAssigned}</td>
                                    <td className="p-3 text-green-600">{r.applied}</td>
                                    <td className="p-3 text-red-600">{r.notApplied}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between p-4 border-t text-sm">
                <span>
                    Page {page} of {totalPages || 1}
                </span>

                <div className="flex gap-3">
                    <button
                        disabled={page === 1}
                        onClick={() => updateFilters({ page: page - 1 })}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <button
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => updateFilters({ page: page + 1 })}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>

        </div>
    );
};

/* ======================
   SUMMARY CARD
====================== */
const SummaryCard = ({ title, value }) => (
    <div className="stat-card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
);

export default AdminJobAssigmentReportPage;
