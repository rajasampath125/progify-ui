import { useEffect, useState } from "react";
import { getAllCandidatesForRecruiter, getAllJobsCandidates } from "../../api/recruiterApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Eye,
  AlertTriangle
} from "lucide-react";
import TableSkeleton from "../../components/ui/TableSkeleton";
import EmptyState from "../../components/ui/EmptyState";

const RecruiterCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "ALL";
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || 15;

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateStatsLoading, setCandidateStatsLoading] = useState(false);
  const [candidateStats, setCandidateStats] = useState({ assigned: 0, applied: 0, pending: 0, rate: "0%" });

  const navigate = useNavigate();

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

  useEffect(() => {
    setLoading(true);
    setError("");
    getAllCandidatesForRecruiter().then((res) => {
      setCandidates(res.data);
    }).catch((err) => {
      console.error("Failed to load candidates", err);
      if (!err.response) {
        setError("Network Error: Backend server is unreachable.");
      } else {
        setError("Failed to load candidates.");
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCandidate) return;

    const loadStats = async () => {
      setCandidateStatsLoading(true);
      try {
        const candidatesRes = await getAllJobsCandidates();
        let assigned = 0;
        let applied = 0;

        const allMap = candidatesRes.data || {};
        Object.values(allMap).forEach(jobCandidates => {
          const records = jobCandidates.filter(c => c.candidateEmail === selectedCandidate.email);
          for (const r of records) {
            assigned += 1;
            if (r.applicationStatus === "APPLIED") applied += 1;
          }
        });

        const pending = assigned - applied;
        const rate = assigned === 0 ? "0%" : `${Math.round((applied / assigned) * 100)}%`;
        setCandidateStats({ assigned, applied, pending, rate });
      } catch (e) {
        console.error("Failed to load candidate stats", e);
      } finally {
        setCandidateStatsLoading(false);
      }
    };
    loadStats();
  }, [selectedCandidate]);

  const categories = [
    ...new Set(candidates.map((c) => c.category).filter(Boolean)),
  ];

  const filteredCandidates = candidates.filter((c) => {
    const matchesCategory =
      categoryFilter === "ALL" || c.category === categoryFilter;

    const searchLower = (search || "").toLowerCase();
    const matchesSearch =
      (c.name || "").toLowerCase().includes(searchLower) ||
      (c.email || "").toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  const totalCandidates = filteredCandidates.length;
  const totalPages = Math.ceil(totalCandidates / pageSize);

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
            Candidates List
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage candidates assigned to your jobs.
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

      {/* MAIN SPLIT LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* LEFT CONTENT: FILTERS & TABLE */}
        <div className={`flex-1 min-w-0 transition-all duration-300 w-full ${selectedCandidate ? "hidden lg:block lg:w-2/3" : ""}`}>

          {/* FILTER BAR */}
          <div className="bg-white border ring-1 ring-gray-900/5 shadow-sm rounded-xl p-4 md:p-5 mb-6">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4 text-gray-400" />
              Filters
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 min-w-[200px] relative">
                <label className="block text-xs font-medium text-gray-500 mb-1">Search Candidates</label>
                <div className="relative inline-block w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={search}
                    onChange={(e) => updateFilters({ q: e.target.value })}
                    className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px]"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[150px] relative">
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <div className="relative inline-block w-full">
                  <select
                    value={categoryFilter}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                    className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 max-h-[36px] bg-white relative"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-5 sm:pt-0 pb-0.5 sm:ml-auto shrink-0">
                <button
                  className="inline-flex items-center justify-center gap-2 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 rounded-md transition-colors whitespace-nowrap"
                  onClick={() => updateFilters({ q: "", category: "ALL" })}
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <TableSkeleton cols={4} rows={6} hideHeader={true} />
                      </td>
                    </tr>
                  ) : paginatedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="py-12">
                          <EmptyState
                            icon="users"
                            title="No candidates found"
                            description="Try adjusting your search or category filter."
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedCandidates.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-700">
                              {(c.name || c.email || "Unknown").charAt(0).toUpperCase()}
                            </div>
                            {c.name || "Unknown"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{c.email}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            {c.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-right flex justify-end gap-2 text-indigo-600">
                          <button
                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-900 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md"
                            onClick={() => setSelectedCandidate(c)}
                            title="View Profile"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {filteredCandidates.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCandidates)}</span> of <span className="font-medium">{totalCandidates}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                      <label htmlFor="pageSizeSelect" className="text-sm text-gray-700">Items per page:</label>
                      <select
                        id="pageSizeSelect"
                        value={pageSize}
                        onChange={(e) => {
                          updateFilters({ size: e.target.value, page: 1 });
                        }}
                        className="block rounded-md border-0 py-1 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => updateFilters({ page: currentPage - 1 })}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => updateFilters({ page: currentPage + 1 })}
                        disabled={currentPage === totalPages || totalPages === 0}
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
        </div>

        {/* RIGHT SIDE PANEL (INLINE) */}
        {selectedCandidate && (
          <div className="w-full lg:w-[400px] shrink-0 bg-white shadow-xl ring-1 ring-gray-900/5 rounded-2xl overflow-hidden sticky top-24 transition-all duration-500 ease-in-out flex flex-col border border-gray-100 animate-fade-in-right z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-6 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-white" id="slide-over-title">Candidate Details</h2>
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="rounded-md bg-transparent text-white hover:text-gray-100 focus:outline-none"
                    onClick={() => setSelectedCandidate(null)}
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative flex-1 px-4 py-6 sm:px-6 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500 shadow-sm flex items-center justify-center text-white text-2xl font-bold">
                  {(selectedCandidate.name || selectedCandidate.email || "U").charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="mb-6">
                <p className="text-xl font-bold text-gray-900">{selectedCandidate.name || "Unknown Name"}</p>
                <p className="text-sm font-medium text-emerald-600">{selectedCandidate.category || "Uncategorized"}</p>
              </div>

              <dl className="divide-y divide-gray-100 uppercase-first">
                <div className="px-0 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">Email Address</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{selectedCandidate.email}</dd>
                </div>
                <div className="px-0 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">Account Status</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {selectedCandidate.isActive !== false ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Active</span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-600/20">Inactive</span>
                    )}
                  </dd>
                </div>
                <div className="px-0 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">Application Stats</dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {candidateStatsLoading ? (
                      <span className="text-gray-400 italic">Calculating activity...</span>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                          Assigned: {candidateStats.assigned}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                          Applied: {candidateStats.applied}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                          Pending: {candidateStats.pending}
                        </span>
                        <span className="inline-flex items-center gap-2 mt-1">
                          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded">
                            Hit Rate: {candidateStats.rate}
                          </span>
                        </span>
                      </div>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <button
                  onClick={() => navigate(`/recruiter/candidates/${selectedCandidate.id}`)}
                  className="w-full justify-center inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  View Full Activity Profile
                </button>
                <p className="mt-2 text-xs text-center text-gray-500">Go to dedicated activity page</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterCandidatesPage;
