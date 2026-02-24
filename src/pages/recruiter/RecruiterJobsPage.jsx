/**
 * RecruiterJobsPage
 *
 * Purpose:
 * - Operational job management view for recruiters
 * - Used for activation/deactivation, candidate navigation, and auditing
 *
 * Entry Points:
 * - Dashboard → Jobs List
 * - Analytics → Drill-down by date (/recruiter/jobs?date=YYYY-MM-DD)
 *
 * This page answers:
 * - What jobs did I create?
 * - What is their current status?
 * - Who are they assigned to?
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRecruiterJobs,
  deactivateRecruiterJob, activateRecruiterJob,
  deleteRecruiterJob, updateRecruiterJob
} from "../../api/recruiterApi";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  Briefcase,
  Calendar as CalendarIcon,
  User,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus
} from "lucide-react";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";

const RecruiterJobsPage = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "ALL";
  const creatorFilter = searchParams.get("creator") || "ALL";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || 15;
  const dateParam = searchParams.get("date"); // YYYY-MM-DD

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "ALL" || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    // Reset to page 1 on filter change unless specifically changing page
    if (!updates.page) newParams.delete("page");
    setSearchParams(newParams);
  };

  // Edit / Delete states
  const [jobToEdit, setJobToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: "", description: "" });
  const [jobToDelete, setJobToDelete] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");


  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getRecruiterJobs();
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load recruiter jobs", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const deactivateJob = async (jobId) => {
    try {
      await deactivateRecruiterJob(jobId);
      loadJobs(); // refresh list
    } catch (err) {
      console.error("Failed to deactivate job", err);
      alert("Failed to deactivate job");
    }
  };

  const activateJob = async (jobId) => {
    try {
      await activateRecruiterJob(jobId);
      loadJobs();
    } catch (err) {
      console.error("Failed to activate job", err);
      alert("Failed to activate job");
    }
  };

  const handleEditJob = (job) => {
    setJobToEdit(job);
    setEditFormData({ title: job.title || "", description: job.description || "" });
    setActionError("");
    setActionSuccess("");
  };

  const submitEditJob = async () => {
    try {
      setActionError("");
      setActionSuccess("");
      await updateRecruiterJob(jobToEdit.id, editFormData);
      setActionSuccess("Job updated successfully.");
      loadJobs();
      setTimeout(() => setJobToEdit(null), 1000);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to update job");
    }
  };

  const handleDeleteJob = (job) => {
    setJobToDelete(job);
    setActionError("");
  };

  const confirmDeleteJob = async () => {
    try {
      setActionError("");
      await deleteRecruiterJob(jobToDelete.id);
      loadJobs();
      setJobToDelete(null);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to delete job");
    }
  };
  const creators = [
    "ALL",
    ...new Set(jobs.map(j => j.createdByName).filter(Boolean)),
  ];
  const filteredJobs = jobs.filter((job) => {
    // DATE FILTER FROM ANALYTICS
    if (dateParam) {
      const jobDate = new Date(job.createdAt)
        .toISOString()
        .split("T")[0]; // YYYY-MM-DD

      if (jobDate !== dateParam) return false;
    }

    const matchesSearch =
      (job.title || "").toLowerCase().includes((search || "").toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && job.active) ||
      (statusFilter === "INACTIVE" && !job.active);

    const matchesCreator =
      creatorFilter === "ALL" ||
      job.createdByName === creatorFilter;

    return matchesSearch && matchesStatus && matchesCreator;
  });


  const totalPages = Math.ceil(filteredJobs.length / pageSize);
  const paginatedJobs = filteredJobs.slice(
    (page - 1) * pageSize,
    page * pageSize
  );


  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          {dateParam && (
            <button
              onClick={() => navigate("/recruiter/analytics")}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-2 inline-flex items-center gap-1 transition-colors"
            >
              <span aria-hidden="true">&larr;</span> Back to Analytics
            </button>
          )}
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
            All Jobs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage jobs created by recruiters across the platform.
          </p>
          {dateParam && (
            <div className="mt-3 rounded-md bg-blue-50 p-3 inline-block">
              <p className="text-sm font-medium text-blue-800">
                Showing jobs created on <strong>{dateParam}</strong>
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/recruiter/jobs/create")}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        </div>
      </div>

      {/* =======================
            TABLE FILTERS
            ======================= */}
      <div className="bg-white border ring-1 ring-gray-900/5 shadow-sm rounded-xl p-4 md:p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4 text-gray-400" />
          Filters
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
            <div className="col-span-1 relative">
              <label className="block text-xs font-medium text-gray-500 mb-1">Search Title</label>
              <div className="relative inline-block w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Developer"
                  value={search}
                  onChange={(e) => updateFilters({ q: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px]"
                />
              </div>
            </div>

            <div className="col-span-1 relative">
              <label className="block text-xs font-medium text-gray-500 mb-1">Job Status</label>
              <div className="relative inline-block w-full">
                <select
                  value={statusFilter}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px] bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="col-span-1 relative">
              <label className="block text-xs font-medium text-gray-500 mb-1">Assigned Recruiter</label>
              <div className="relative inline-block w-full">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  value={creatorFilter}
                  onChange={(e) => updateFilters({ creator: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 pl-9 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px] bg-white relative z-0"
                >
                  {creators.map((c) => (
                    <option key={c} value={c}>{c === "ALL" ? "All Recruiters" : c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-1 relative">
              <label className="block text-xs font-medium text-gray-500 mb-1">Creation Date</label>
              <div className="relative inline-block w-full">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateParam || ""}
                  onChange={(e) => updateFilters({ date: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px]"
                />
              </div>
            </div>

          </div>

          <div className="shrink-0 w-full lg:w-auto pt-2 lg:pt-0 pb-0.5">
            <button
              className="inline-flex items-center justify-center gap-2 bg-white px-4 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 rounded-md transition-colors w-full lg:w-auto whitespace-nowrap"
              onClick={() => updateFilters({ q: "", status: "ALL", creator: "ALL", date: "" })}
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* =======================
             JOBS TABLE
            ======================= */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Candidate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <TableSkeleton cols={6} rows={6} hideHeader={true} />
                  </td>
                </tr>
              ) : !loading && error && jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-12">
                      <EmptyState
                        icon="jobs"
                        title="No jobs found"
                        description="Try adjusting your filters or clearing the date range."
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          {job.title}
                          <div className="text-xs text-gray-500 font-normal mt-0.5">{job.categoryName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {job.candidateName || job.candidateEmail ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                            {(job.candidateName || job.candidateEmail).charAt(0).toUpperCase()}
                          </div>
                          {job.candidateName || job.candidateEmail}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {job.active ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-600/20">
                          <XCircle className="w-3.5 h-3.5 text-gray-500" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {job.createdAt ? new Date(job.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {job.createdByName || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-right flex justify-end gap-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 transition-colors p-1.5 rounded-md hover:bg-indigo-50"
                        onClick={() => handleEditJob(job)}
                        title="Edit Job"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {job.active ? (
                        <button
                          className="text-amber-600 hover:text-amber-900 transition-colors font-semibold"
                          onClick={() => deactivateJob(job.id)}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="text-green-600 hover:text-green-900 transition-colors font-semibold"
                          onClick={() => activateJob(job.id)}
                        >
                          Activate
                        </button>
                      )}

                      <button
                        className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-md hover:bg-red-50"
                        onClick={() => handleDeleteJob(job)}
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredJobs.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, filteredJobs.length)}</span> of <span className="font-medium">{filteredJobs.length}</span> results
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
        )}
      </div>

      {/* =======================
             EDIT JOB MODAL
      ======================= */}
      {jobToEdit && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Edit Job: {jobToEdit.title}</h3>
                  {actionError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded-md">{actionError}</div>}
                  {actionSuccess && <div className="mb-4 text-sm text-green-600 bg-green-50 p-2 rounded-md">{actionSuccess}</div>}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Job Title</label>
                      <input
                        type="text"
                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                    onClick={submitEditJob}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setJobToEdit(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================
             DELETE CONFIRMATION MODAL
      ======================= */}
      {jobToDelete && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Delete Job</h3>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Are you sure you want to delete <span className="font-semibold text-gray-900">{jobToDelete.title}</span>? This action cannot be undone.</p>
                        {actionError && (
                          <div className="mt-3 p-3 text-red-700 bg-red-50 rounded-md ring-1 ring-red-200">
                            <span className="font-semibold block mb-1">Error: {actionError}</span>
                            If you believe this is a mistake, please contact your system administrator. Only Admins can delete jobs with active applicants.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={confirmDeleteJob}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setJobToDelete(null)}
                  >
                    Cancel
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

export default RecruiterJobsPage;
