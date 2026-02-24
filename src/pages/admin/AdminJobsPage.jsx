import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  getAdminJobsPaginated,
  activateJob,
  deactivateJob,
  getJobDownloadAudit,
  deleteJob,
} from "../../api/adminApi";
import {
  Search,
  Calendar,
  Filter,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";

const PAGE_SIZE = 10;

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [downloadAudit, setDownloadAudit] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /* =======================
     FILTER STATE (URL SYNC)
  ======================= */
  const statusFilter = searchParams.get("status") || "ALL";
  const recruiterFilter = searchParams.get("recruiter") || "";
  const candidateFilter = searchParams.get("candidate") || "";
  const categoryFilter = searchParams.get("category") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = Number(searchParams.get("page")) || 1;

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "ALL" || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    // Reset to page 1 if any filter other than page is updated
    if (Object.keys(updates).some(k => k !== "page")) {
      newParams.delete("page");
    }
    setSearchParams(newParams);
  };

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page: page - 1,
        size: PAGE_SIZE,
        status: statusFilter === "ALL" ? undefined : (statusFilter === "ACTIVE"),
        recruiter: recruiterFilter || undefined,
        candidate: candidateFilter || undefined,
        category: categoryFilter || undefined,
        from: dateFrom ? `${dateFrom}T00:00:00` : undefined,
        to: dateTo ? `${dateTo}T23:59:59` : undefined,
      };

      const res = await getAdminJobsPaginated(params);
      setJobs(res.data.content || []);
      setTotalRecords(res.data.totalElements || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error("Jobs Error:", err);
      if (!err.response) {
        setError("Network Error: Backend server is unreachable.");
      } else {
        setError("Failed to load jobs.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [page, statusFilter, recruiterFilter, candidateFilter, categoryFilter, dateFrom, dateTo]);

  /* =======================
     ACTIONS
  ======================= */
  const handleActivate = async (id) => {
    try {
      await activateJob(id);
      loadJobs();
    } catch (err) {
      alert("Failed to activate job");
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateJob(id);
      loadJobs();
    } catch (err) {
      alert("Failed to deactivate job");
    }
  };

  const handleDelete = async (job) => {
    if (window.confirm(`Are you sure you want to delete job ${job.title}?`)) {
      try {
        await deleteJob(job.id);
        loadJobs();
      } catch (err) {
        alert(err?.response?.data?.message || "Failed to delete job");
      }
    }
  };

  const openDownloadModal = async (jobId) => {
    const res = await getJobDownloadAudit(jobId);
    setDownloadAudit(res.data || []);
    setSelectedJobId(jobId);
    setShowModal(true);
  };


  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
            Jobs Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage all job listings and their assignment status.
          </p>
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

      {/* =======================
            TABLE FILTERS
            ======================= */}
      <div className="mb-6 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4 text-gray-400" />
          Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="col-span-1 relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Recruiter</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Name..."
                value={recruiterFilter}
                onChange={(e) => updateFilters({ recruiter: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-1 relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Candidate</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Name/Email..."
                value={candidateFilter}
                onChange={(e) => updateFilters({ candidate: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-1 relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Category..."
                value={categoryFilter}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-1 relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
            <div className="relative inline-block w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px]"
              />
            </div>
          </div>

          <div className="col-span-1 relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
            <div className="relative inline-block w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => updateFilters({ dateTo: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px]"
              />
            </div>
          </div>

        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
            onClick={() => updateFilters({ status: "ALL", recruiter: "", candidate: "", category: "", dateFrom: "", dateTo: "" })}
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>


      {/* =======================
             JOBS TABLE
            ======================= */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Candidate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CreatedBy (Recruiter)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <TableSkeleton cols={6} rows={7} hideHeader={true} />
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="jobs"
                      title="No jobs found"
                      description="Try adjusting your filters or date range to see results."
                    />
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{job.title}</span>
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mt-1 w-fit">
                          {job.categoryName}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">{new Date(job.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {job.candidateName || job.candidateEmail
                        ? <span className="font-medium">{job.candidateName || job.candidateEmail}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{job.createdByName}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {job.active ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-center">
                      <button
                        onClick={() => openDownloadModal(job.id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700 font-semibold hover:bg-blue-100 transition-colors ring-1 ring-inset ring-blue-700/10"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {job.downloadCount ?? 0}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-right">
                      <div className="flex justify-end gap-3 items-center">
                        {job.active ? (
                          <button
                            className="text-amber-600 hover:text-amber-900 transition-colors font-semibold"
                            onClick={() => handleDeactivate(job.id)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="text-green-600 hover:text-green-900 transition-colors font-semibold"
                            onClick={() => handleActivate(job.id)}
                          >
                            Activate
                          </button>
                        )}

                        <button
                          className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50"
                          onClick={() => handleDelete(job)}
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</span> to <span className="font-medium">{Math.min(page * PAGE_SIZE, totalRecords)}</span> of <span className="font-medium">{totalRecords}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => updateFilters({ page: page - 1 })}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => updateFilters({ page: page + 1 })}
                  disabled={page === totalPages || totalPages === 0}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* =======================
             DOWNLOAD AUDIT MODAL
            ======================= */}
      {showModal && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                        Download Audit Log
                      </h3>
                      <div className="mt-4">
                        {downloadAudit.length === 0 ? (
                          <p className="text-sm text-gray-500">No downloads recorded for this job.</p>
                        ) : (
                          <div className="mt-2 text-left">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                              <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Candidate</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Downloaded At</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                  {downloadAudit.map((item, index) => (
                                    <tr key={index}>
                                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.candidateEmail}</td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(item.downloadedAt).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;
