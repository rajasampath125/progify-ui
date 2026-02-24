import { useEffect, useState } from "react";
import {
  getAllCandidateJobs,
  downloadResume,
} from "../../api/candidateApi";
import { useSearchParams } from "react-router-dom";
import {
  Download,
  ExternalLink,
  History,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";

/* =====================
   DESCRIPTION MODAL
===================== */
function DescriptionModal({ job, onClose }) {
  if (!job) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 pr-4">{job.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
        <div className="flex justify-end p-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================
   PAGINATION
===================== */
function Pagination({ page, totalPages, totalElements, pageSize, goToPage, changePageSize }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-semibold">
            {totalElements === 0 ? 0 : (page - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold">
            {Math.min(page * pageSize, totalElements)}
          </span>{" "}
          of <span className="font-semibold">{totalElements}</span> results
        </p>

        <div className="flex items-center gap-4">
          {/* page size */}
          <select
            value={pageSize}
            onChange={(e) => changePageSize(Number(e.target.value))}
            className="filter-input"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>

          {/* prev/next */}
          <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 bg-white select-none">
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
              className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden w-full justify-between items-center mt-3">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </button>
        <span className="text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-md">
          {page} / {totalPages || 1}
        </span>
        <button
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}

/* =====================
   PAGE
===================== */
const CandidateJobHistoryPage = () => {
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 5);

  const [searchTitle, setSearchTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    loadJobs();
  }, [page, pageSize, searchTitle, statusFilter, dateFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllCandidateJobs(page - 1, pageSize, searchTitle, statusFilter, dateFilter);
      setJobs(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } catch (err) {
      console.error("Failed to load candidate jobs", err);
      if (!err.response) {
        setError("Network Error: Backend server is unreachable.");
      } else {
        setError("Failed to load your job history.");
      }
    } finally {
      setLoading(false);
    }
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

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setSearchParams({ page: p, pageSize });
  };

  const changePageSize = (size) => {
    setSearchParams({ page: 1, pageSize: size });
  };

  const handleClear = () => {
    setSearchTitle("");
    setStatusFilter("ALL");
    setDateFilter("");
    setSearchParams({ page: 1, pageSize });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      {/* DESCRIPTION MODAL */}
      <DescriptionModal job={selectedJob} onClose={() => setSelectedJob(null)} />

      {/* PAGE HEADER */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <History className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="page-header">All Jobs</h1>
            <p className="page-subheader">Your complete job application history.</p>
          </div>
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
      <div className="bg-white border ring-1 ring-gray-900/5 shadow-sm rounded-xl p-4 md:p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end w-full">
          {/* Search */}
          <div className="w-full sm:w-1/3 relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Search Jobs</label>
            <div className="relative inline-block w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                placeholder="Search by job title..."
                value={searchTitle}
                onChange={(e) => {
                  setSearchTitle(e.target.value);
                  setSearchParams({ page: 1, pageSize });
                }}
                className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px]"
              />
            </div>
          </div>

          {/* Status */}
          <div className="w-full sm:w-auto relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <div className="relative inline-block w-full">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setSearchParams({ page: 1, pageSize });
                }}
                className="block w-full sm:w-40 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px] bg-white relative"
              >
                <option value="ALL">All Status</option>
                <option value="APPLIED">Applied</option>
                <option value="NOT_APPLIED">Not Applied</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="w-full sm:w-auto relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Applied Date</label>
            <div className="relative inline-block w-full">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setSearchParams({ page: 1, pageSize });
                }}
                className="block w-full sm:w-auto rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px] bg-white relative text-gray-600"
              />
            </div>
          </div>

          <div className="w-full sm:w-auto flex mt-2 sm:mt-0 ml-auto">
            <button
              onClick={handleClear}
              className="inline-flex items-center justify-center gap-2 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 rounded-md transition-colors w-full sm:w-auto"
            >
              <X className="w-4 h-4" /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {!loading && error && jobs.length === 0 && (
        <div className="card p-10 text-center animate-fade-in">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && jobs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5">
          <EmptyState
            icon="inbox"
            title="No jobs found"
            description="No jobs match your current filters. Try adjusting or clearing them."
            action={{ label: "Clear Filters", onClick: handleClear }}
          />
        </div>
      )}

      {/* TABLE */}
      {jobs.length > 0 && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Link</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied At</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <TableSkeleton cols={6} rows={5} />
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.jobId} className="hover:bg-gray-50 transition-colors">
                      {/* TITLE */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 max-w-[180px] truncate">
                        {job.title}
                      </td>

                      {/* DESCRIPTION */}
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[320px]">
                        <div className="line-clamp-2 leading-relaxed whitespace-pre-line text-xs font-medium">
                          {job.description}
                        </div>
                        {job.description?.length > 120 && (
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                          >
                            View more
                          </button>
                        )}
                      </td>

                      {/* JOB LINK */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {job.jobLink && job.jobLink !== "N/A" ? (
                          <a
                            href={job.jobLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
                          >
                            View <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs italic">N/A</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {(job.applicationStatus ?? "NOT_APPLIED") === "APPLIED" ? (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Applied
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            Not Applied
                          </span>
                        )}
                      </td>

                      {/* APPLIED AT */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {job.appliedAt
                          ? new Date(job.appliedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                          : "—"}
                      </td>

                      {/* ACTIONS */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => handleDownload(job)}
                          className="inline-flex items-center justify-center gap-2 bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Resume
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            goToPage={goToPage}
            changePageSize={changePageSize}
          />
        </div>
      )}
    </div>
  );
};

export default CandidateJobHistoryPage;