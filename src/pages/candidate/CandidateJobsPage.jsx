import { useEffect, useState } from "react";
import {
    getAvailableJobs,
    applyToJob,
    downloadResume,
} from "../../api/candidateApi";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, Calendar, AlertTriangle } from "lucide-react";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";

const getTodayDate = () => new Date().toISOString().split("T")[0];

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
    const pageSize = Number(searchParams.get("pageSize") || 5);

    // 🔹 Fetch paginated + filtered jobs from backend
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

    const paginatedJobs = jobs || [];

    const goToPage = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setSearchParams({ page: newPage, pageSize });
    };

    const changePageSize = (newSize) => {
        setSearchParams({ page: 1, pageSize: newSize });
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

            // Generate filename based on candidate name and job title
            let candidateName = "Candidate";
            try {
                const profileObjStr = localStorage.getItem("candidateProfile");
                if (profileObjStr) {
                    const profile = JSON.parse(profileObjStr);
                    if (profile.name) {
                        candidateName = profile.name;
                    }
                }
            } catch (e) {
                console.error("Could not parse profile from localStorage", e);
            }

            const safeCandidateName = candidateName.replace(/[^a-zA-Z0-9]/g, "_");
            const safeJobTitle = job.title ? job.title.replace(/[^a-zA-Z0-9]/g, "_") : "Job_Details_Document";
            const fileName = `${safeCandidateName}_${safeJobTitle}.docx`;

            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            if (error.response?.status === 410) {
                alert("Resume expired. Please contact recruiter.");
            } else {
                alert("Failed to download resume");
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
                        Available Jobs
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Find and apply to jobs that match your skillset.</p>
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

            {/* FILTER BAR */}
            <div className="mb-6 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input
                        placeholder="Search by job title..."
                        value={searchTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="block w-full sm:w-64 rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />

                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="block w-full sm:w-auto rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />

                    {/* Today's Jobs quick button */}
                    <button
                        onClick={handleTodayFilter}
                        title="Show only jobs assigned today"
                        className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset transition-colors ${dateFilter === getTodayDate()
                            ? "bg-indigo-600 text-white ring-indigo-600 hover:bg-indigo-500"
                            : "bg-white text-gray-900 ring-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Today's Jobs
                    </button>
                </div>

                <button
                    onClick={handleClear}
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600 transition-colors w-full sm:w-auto text-center"
                >
                    Clear Filters
                </button>
            </div>

            {/* LOADING SKELETON */}
            {loading && (
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden mt-6">
                    <TableSkeleton cols={6} rows={5} />
                </div>
            )}

            {/* EMPTY STATE */}
            {!loading && paginatedJobs.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5">
                    <EmptyState
                        icon="jobs"
                        title={dateFilter === getTodayDate() ? "No jobs assigned for today" : "No available jobs found"}
                        description={dateFilter === getTodayDate() ? "No jobs have been assigned for today's date." : "Please check back later — new opportunities are added regularly."}
                        action={dateFilter ? { label: "Show All Jobs", onClick: handleClear } : undefined}
                    />
                </div>
            )}

            {paginatedJobs.length > 0 && (
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden mt-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paginatedJobs.map((job) => (
                                    <tr key={job.jobId} className="hover:bg-gray-50 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{job.title}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <a href={job.jobLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900 font-medium transition-colors">
                                                Job Link
                                            </a>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <button
                                                onClick={() => handleDownload(job)}
                                                className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 transform transition-all"
                                            >
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                Resume
                                            </button>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${job.applied
                                                ? "bg-green-50 text-green-700 ring-green-600/20"
                                                : "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                                                }`}>
                                                {job.applied ? "APPLIED" : "NOT APPLIED"}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-right">
                                            {!job.applied ? (
                                                <button
                                                    onClick={() => handleApply(job.jobId)}
                                                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 hover:-translate-y-0.5 transform transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    Apply
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    Applied
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{totalJobs === 0 ? 0 : (page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, totalJobs)}</span> of <span className="font-medium">{totalJobs}</span> results
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">Go to</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={totalPages || 1}
                                        value={page}
                                        onChange={(e) => goToPage(Number(e.target.value))}
                                        className="block w-16 rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                    <select
                                        value={pageSize}
                                        onChange={(e) => changePageSize(Number(e.target.value))}
                                        className="block rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value={5}>5 / page</option>
                                        <option value={10}>10 / page</option>
                                        <option value={20}>20 / page</option>
                                    </select>
                                </div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => goToPage(page - 1)}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button
                                        onClick={() => goToPage(page + 1)}
                                        disabled={page === totalPages || totalPages === 0}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateJobsPage;