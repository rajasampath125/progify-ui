import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getAdminJobAssignmentAnalytics } from "../../api/adminApi";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

const AdminJobAssigmentReportPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPage = Number(searchParams.get("page")) || 1;
    const [page, setPage] = useState(initialPage);
    const pageSize = 10;
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const [sortOrder, setSortOrder] = useState(
        searchParams.get("sort") || "DESC"
    );
    const [filters, setFilters] = useState({
        from: searchParams.get("from") || "",
        to: searchParams.get("to") || "",
        recruiter: searchParams.get("recruiter") || "",
        candidate: searchParams.get("candidate") || ""
    });

    // applied filters (used only for filtering UI, NOT API)
    const [appliedFilters, setAppliedFilters] = useState(null);
    const fromParam = searchParams.get("from") || "";
    const toParam = searchParams.get("to") || "";
    useEffect(() => {
        setLoading(true);

        getAdminJobAssignmentAnalytics(fromParam || undefined, toParam || undefined)
            .then((res) => {
                setRows(res.data || []);
            })
            .finally(() => setLoading(false));
    }, [fromParam, toParam]);

    // /* ======================
    //    FETCH ALL DATA ON LOAD
    // ====================== */
    // useEffect(() => {
    //     if (fetched.current) return;
    //     fetched.current = true;

    //     setLoading(true);

    //     getAdminJobAssignmentAnalytics()
    //         .then((res) => {
    //             setRows(res.data || []);
    //         })
    //         .finally(() => setLoading(false));
    // }, []);

    /* ======================
       FILTERED ROWS
    ====================== */
    const filteredRows = rows
        .filter((r) => {
            const rowDate = new Date(r.date);

            if (fromParam && rowDate < new Date(fromParam)) return false;
            if (toParam && rowDate > new Date(toParam)) return false;

            if (
                filters.recruiter &&
                !r.recruiterName
                    .toLowerCase()
                    .includes(filters.recruiter.toLowerCase())
            )
                return false;

            if (
                filters.candidate &&
                !r.candidateName
                    .toLowerCase()
                    .includes(filters.candidate.toLowerCase())
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
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">

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

                    <div>
                        <label className="text-xs text-gray-500">Recruiter</label>
                        <input
                            placeholder="REC / SUPER_ADMIN"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            value={filters.recruiter}
                            onChange={(e) =>
                                setFilters({ ...filters, recruiter: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500">Candidate</label>
                        <input
                            placeholder="email"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            value={filters.candidate}
                            onChange={(e) =>
                                setFilters({ ...filters, candidate: e.target.value })
                            }
                        />
                    </div>

                    <button
                        onClick={() => {
                            //setAppliedFilters(filters);
                            setPage(1);

                            setSearchParams({
                                ...(filters.from && { from: filters.from }),
                                ...(filters.to && { to: filters.to }),
                                ...(filters.recruiter && { recruiter: filters.recruiter }),
                                ...(filters.candidate && { candidate: filters.candidate }),
                                page: 1
                            });
                        }}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                        <MagnifyingGlassIcon className="h-4 w-4" />
                        Search
                    </button>

                    <button
                        onClick={() => {
                            setFilters({
                                from: "",
                                to: "",
                                recruiter: "",
                                candidate: ""
                            });
                            //setAppliedFilters(null);
                            setPage(1);
                            setSearchParams({});
                        }}
                        className="flex items-center justify-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
                    >
                        <XMarkIcon className="h-4 w-4" />
                        Clear
                    </button>
                </div>
            </div>

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
                                    setSortOrder(next);

                                    setSearchParams({
                                        ...(filters.from && { from: filters.from }),
                                        ...(filters.to && { to: filters.to }),
                                        ...(filters.recruiter && { recruiter: filters.recruiter }),
                                        ...(filters.candidate && { candidate: filters.candidate }),
                                        sort: next,
                                        page: 1
                                    });
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
                                <td colSpan={6} className="p-6 text-center text-gray-400">
                                    Loading analytics…
                                </td>
                            </tr>
                        ) : filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-gray-400">
                                    No data found
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
                        onClick={() => {
                            const next = page - 1;
                            setPage(next);
                            setSearchParams({
                                ...Object.fromEntries(searchParams),
                                page: next
                            });
                        }}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <button
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => {
                            const next = page + 1;
                            setPage(next);
                            setSearchParams({
                                ...Object.fromEntries(searchParams),
                                page: next
                            });
                        }}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        Next
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
    <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
    </div>
);

export default AdminJobAssigmentReportPage;
