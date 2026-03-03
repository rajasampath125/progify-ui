import { useEffect, useState } from "react";
import {
    getAvailableJobs,
    applyToJob,
    downloadResume,
} from "../../api/candidateApi";
import { useSearchParams } from "react-router-dom";
import {
    Search, AlertTriangle, ExternalLink,
    ChevronLeft, ChevronRight, CheckCircle2, Download, Calendar,
} from "lucide-react";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";

// Returns YYYY-MM-DD in LOCAL timezone (not UTC — avoids "tomorrow" bug)
const getTodayDate = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const CandidateJobsPage = () => {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [totalJobs, setTotalJobs] = useState(0);
    const [searchTitle, setSearchTitle] = useState("");
    const [dateFilter, setDateFilter] = useState(getTodayDate());
    const [error, setError] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);

    const fetchJobs = (pg, size, title, date) => {
        setLoading(true);
        setError("");
        getAvailableJobs(pg - 1, size, title, date)
            .then((res) => {
                const data = res?.data;
                if (data && data.content) {
                    setJobs(data.content);
                    setTotalPages(data.totalPages ?? 0);
                    setTotalJobs(data.totalElements ?? 0);
                } else if (Array.isArray(data)) {
                    setJobs(data);
                    setTotalPages(1);
                    setTotalJobs(data.length);
                } else {
                    setJobs([]);
                    setTotalPages(0);
                    setTotalJobs(0);
                }
            })
            .catch((err) => {
                console.error("Fetch Jobs Error:", err);
                if (!err.response) {
                    setError("Network Error: Backend server is unreachable.");
                } else {
                    setError("Failed to load jobs.");
                }
                setJobs([]);
                setTotalPages(0);
                setTotalJobs(0);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchJobs(page, pageSize, searchTitle, dateFilter);
    }, [page, pageSize, searchTitle, dateFilter]);

    const handleApply = async (jobId) => {
        await applyToJob(jobId);
        fetchJobs(page, pageSize, searchTitle, dateFilter);
    };

    const handleTitleChange = (value) => {
        setSearchTitle(value);
        setSearchParams({ page: 1, pageSize });
    };

    const handleDateChange = (value) => {
        setDateFilter(value);
        setSearchParams({ page: 1, pageSize });
    };

    const handleTodayFilter = () => {
        const today = getTodayDate();
        setDateFilter(today);
        setSearchParams({ page: 1, pageSize });
    };

    const handleClear = () => {
        setSearchTitle("");
        setDateFilter("");
        setSearchParams({ page: 1, pageSize });
    };

    const goToPage = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setSearchParams({ page: newPage, pageSize });
    };

    const handleDownload = async (job) => {
        try {
            const response = await downloadResume(job.jobId);
            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            let candidateName = "Candidate";
            try {
                const profileObjStr = localStorage.getItem("candidateProfile");
                if (profileObjStr) {
                    const profile = JSON.parse(profileObjStr);
                    if (profile.name) candidateName = profile.name;
                }
            } catch (e) { }
            const safeName = candidateName.replace(/[^a-zA-Z0-9]/g, "_");
            const safeTitle = job.title ? job.title.replace(/[^a-zA-Z0-9]/g, "_") : "Job";
            a.download = `${safeName}_${safeTitle}.docx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (error.response?.status === 410) {
                alert("Resume expired. Please contact recruiter.");
            } else {
                alert("Failed to download resume");
            }
        }
    };

    const paginatedJobs = jobs || [];
    const startItem = totalJobs === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalJobs);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            {/* PAGE HEADER */}
            <div className="mb-8">
                <h1 className="page-header">Available Jobs</h1>
                <p className="page-subheader">Jobs assigned to you — review and apply to each one.</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-red-800">Connection Failed</p>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* FILTER BAR */}
            <div className="mb-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-4 flex flex-col sm:flex-row gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                        placeholder="Search by job title..."
                        value={searchTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="block w-full rounded-xl border-0 py-2 pl-9 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>

                {/* Date */}
                <div className="relative w-full sm:w-auto">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="block w-full sm:w-auto rounded-xl border-0 py-2 pl-9 pr-3 text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>

                {/* Today quick btn */}
                <button
                    onClick={handleTodayFilter}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset transition-all ${dateFilter === getTodayDate()
                        ? "bg-indigo-600 text-white ring-indigo-600 hover:bg-indigo-500"
                        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                        }`}
                >
                    Today's Jobs
                </button>

                <button
                    onClick={handleClear}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors px-2 py-2 sm:ml-auto"
                >
                    Clear Filters
                </button>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="bg-white shadow-sm ring-1 ring-slate-900/5 rounded-2xl overflow-hidden">
                    <TableSkeleton cols={6} rows={10} />
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && paginatedJobs.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5">
                    <EmptyState
                        icon="jobs"
                        title={dateFilter === getTodayDate() ? "No jobs assigned for today" : "No available jobs found"}
                        description={dateFilter === getTodayDate() ? "No jobs have been assigned for today's date." : "Please check back later — new opportunities are added regularly."}
                        action={dateFilter ? { label: "Show All Jobs", onClick: handleClear } : undefined}
                    />
                </div>
            )}

            {/* TABLE */}
            {!loading && paginatedJobs.length > 0 && (
                <div className="bg-white shadow-sm ring-1 ring-slate-900/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Job Title</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Links</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resume</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {paginatedJobs.map((job) => (
                                    <tr key={job.jobId} className="hover:bg-slate-50/70 transition-colors">
                                        {/* TITLE */}
                                        <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-slate-800 max-w-[200px] truncate">
                                            {job.title}
                                        </td>

                                        {/* JOB LINK */}
                                        <td className="whitespace-nowrap px-5 py-3.5 text-sm">
                                            {job.jobLink && job.jobLink !== "N/A" ? (
                                                <a
                                                    href={job.jobLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Job Link
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">N/A</span>
                                            )}
                                        </td>

                                        {/* RESUME DOWNLOAD */}
                                        <td className="whitespace-nowrap px-5 py-3.5 text-sm">
                                            <button
                                                onClick={() => handleDownload(job)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 transform transition-all"
                                            >
                                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                                Resume
                                            </button>
                                        </td>

                                        {/* STATUS */}
                                        <td className="whitespace-nowrap px-5 py-3.5 text-sm">
                                            {job.applied ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3" /> Applied
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                                    Not Applied
                                                </span>
                                            )}
                                        </td>

                                        {/* CREATED AT */}
                                        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500">
                                            {job.createdAt ? new Date(job.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                        </td>

                                        {/* ACTION */}
                                        <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-right">
                                            {!job.applied ? (
                                                <button
                                                    onClick={() => handleApply(job.jobId)}
                                                    className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 hover:-translate-y-0.5 transform transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    Apply
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Applied
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION — simple Prev / page-indicator / Next */}
                    <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3">
                        <p className="text-sm text-slate-600">
                            Showing <span className="font-semibold text-slate-900">{startItem}</span>–<span className="font-semibold text-slate-900">{endItem}</span> of <span className="font-semibold text-slate-900">{totalJobs}</span> results
                        </p>
                        <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm">
                            <button
                                onClick={() => goToPage(page - 1)}
                                disabled={page === 1}
                                className="relative inline-flex items-center gap-1 rounded-l-xl px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Prev
                            </button>
                            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 bg-white select-none">
                                {page} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => goToPage(page + 1)}
                                disabled={page === totalPages || totalPages === 0}
                                className="relative inline-flex items-center gap-1 rounded-r-xl px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateJobsPage;