// AdminJobsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getAdminJobs,
  activateJob,
  deactivateJob,
  getJobDownloadAudit,
} from "../../api/adminApi";

const PAGE_SIZE = 10;

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [downloadAudit, setDownloadAudit] = useState([]);
  const [showModal, setShowModal] = useState(false);

  /* =======================
     FILTER STATE (URL SYNC)
  ======================= */
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "ALL"
  );
  const [recruiterFilter, setRecruiterFilter] = useState(
    searchParams.get("recruiter") || ""
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || ""
  );
  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  useEffect(() => {
    setLoading(true);
    getAdminJobs()
      .then((res) => setJobs(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  /* =======================
     FILTERED DATA
  ======================= */
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (statusFilter !== "ALL") {
        if (statusFilter === "ACTIVE" && !job.active) return false;
        if (statusFilter === "INACTIVE" && job.active) return false;
      }

      if (
        recruiterFilter &&
        !job.createdByName
          ?.toLowerCase()
          .includes(recruiterFilter.toLowerCase())
      )
        return false;

      if (
        categoryFilter &&
        !job.categoryName
          ?.toLowerCase()
          .includes(categoryFilter.toLowerCase())
      )
        return false;

      return true;
    });
  }, [jobs, statusFilter, recruiterFilter, categoryFilter]);

  const totalRecords = filteredJobs.length;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

  const paginatedJobs = filteredJobs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* =======================
     URL SYNC
  ======================= */
  useEffect(() => {
    setSearchParams({
      ...(statusFilter !== "ALL" && { status: statusFilter }),
      ...(recruiterFilter && { recruiter: recruiterFilter }),
      ...(categoryFilter && { category: categoryFilter }),
      page,
    });
  }, [statusFilter, recruiterFilter, categoryFilter, page, setSearchParams]);

  /* =======================
     ACTIONS
  ======================= */
  const handleActivate = async (id) => {
    await activateJob(id);
    const res = await getAdminJobs();
    setJobs(res.data || []);
  };

  const handleDeactivate = async (id) => {
    await deactivateJob(id);
    const res = await getAdminJobs();
    setJobs(res.data || []);
  };


  const openDownloadModal = async (jobId) => {
    const res = await getJobDownloadAudit(jobId);
    setDownloadAudit(res.data || []);
    setSelectedJobId(jobId);
    setShowModal(true);
  };


  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-1">Jobs</h1>
      <p className="text-sm text-gray-500 mb-6">
        System-wide jobs created by recruiters
      </p>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <input
          placeholder="Filter by recruiter"
          className="border rounded-lg px-3 py-2 text-sm"
          value={recruiterFilter}
          onChange={(e) => {
            setRecruiterFilter(e.target.value);
            setPage(1);
          }}
        />

        <input
          placeholder="Filter by category"
          className="border rounded-lg px-3 py-2 text-sm"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        />

        <button
          onClick={() => {
            setStatusFilter("ALL");
            setRecruiterFilter("");
            setCategoryFilter("");
            setPage(1);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Clear
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Job ID</th>
              <th className="p-3">CreatedBy(Recruiter)</th>
              <th className="p-3">Category</th>
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created At</th>
              <th className="p-3 text-center">Downloads(Resume)</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  Loading jobs…
                </td>
              </tr>
            ) : paginatedJobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  No jobs found
                </td>
              </tr>
            ) : (
              paginatedJobs.map((job) => (
                <tr key={job.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{job.id}</td>
                  <td className="p-3 font-medium">{job.createdByName}</td>
                  <td className="p-3">{job.categoryName}</td>
                  <td className="p-3">{job.title}</td>
                  <td
                    className={`p-3 font-semibold ${
                      job.active ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {job.active ? "ACTIVE" : "INACTIVE"}
                  </td>
                  <td className="p-3">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => openDownloadModal(job.id)}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      {job.downloadCount ?? 0}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    {job.active ? (
                      <button
                        onClick={() => handleDeactivate(job.id)}
                        className="px-3 py-1 rounded-md border border-red-300 bg-red-50 text-red-700 text-xs"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(job.id)}
                        className="px-3 py-1 rounded-md border border-green-300 bg-green-50 text-green-700 text-xs"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

{/* When admin clicks the download count →
Show:
Candidate email
Download timestamp
Total downloads per candidate */}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[600px] max-h-[80vh] overflow-y-auto p-6 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Download Audit
            </h2>

            {downloadAudit.length === 0 ? (
              <p className="text-sm text-gray-500">
                No downloads recorded.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Candidate</th>
                    <th className="p-2">Downloaded At</th>
                  </tr>
                </thead>
                <tbody>
                  {downloadAudit.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{item.candidateEmail}</td>
                      <td className="p-2">
                        {new Date(item.downloadedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>
          Showing{" "}
          {totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, totalRecords)} of {totalRecords} records
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminJobsPage;


// import { useEffect, useMemo, useState } from "react";
// import {
//   getAdminJobs,
//   activateJob,
//   deactivateJob,
// } from "../../api/adminApi";

// const PAGE_SIZE = 10;

// const AdminJobsPage = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   /* =======================
//      FILTER STATE
//   ======================= */
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [recruiterFilter, setRecruiterFilter] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");

//   /* =======================
//      PAGINATION
//   ======================= */
//   const [page, setPage] = useState(1);

//   useEffect(() => {
//     setLoading(true);
//     getAdminJobs()
//       .then((res) => setJobs(res.data || []))
//       .finally(() => setLoading(false));
//   }, []);

//   /* =======================
//      FILTERED DATA
//   ======================= */
//   const filteredJobs = useMemo(() => {
//     return jobs.filter((job) => {
//       if (statusFilter !== "ALL") {
//         if (statusFilter === "ACTIVE" && !job.active) return false;
//         if (statusFilter === "INACTIVE" && job.active) return false;
//       }

//       if (
//         recruiterFilter &&
//         !job.createdByName
//           ?.toLowerCase()
//           .includes(recruiterFilter.toLowerCase())
//       )
//         return false;

//       if (
//         categoryFilter &&
//         !job.categoryName
//           ?.toLowerCase()
//           .includes(categoryFilter.toLowerCase())
//       )
//         return false;

//       return true;
//     });
//   }, [jobs, statusFilter, recruiterFilter, categoryFilter]);

//   const totalRecords = filteredJobs.length;
//   const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

//   const paginatedJobs = filteredJobs.slice(
//     (page - 1) * PAGE_SIZE,
//     page * PAGE_SIZE
//   );

//   /* =======================
//      ACTIONS
//   ======================= */
//   const handleActivate = async (id) => {
//     await activateJob(id);
//     const res = await getAdminJobs();
//     setJobs(res.data || []);
//   };

//   const handleDeactivate = async (id) => {
//     await deactivateJob(id);
//     const res = await getAdminJobs();
//     setJobs(res.data || []);
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       {/* HEADER */}
//       <h1 className="text-2xl font-semibold mb-1">Jobs</h1>
//       <p className="text-sm text-gray-500 mb-6">
//         System-wide jobs created by recruiters
//       </p>

//       {/* =======================
//           FILTER BAR
//       ======================= */}
//       <div className="bg-white border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
//         <select
//           className="border rounded-lg px-3 py-2 text-sm"
//           value={statusFilter}
//           onChange={(e) => {
//             setStatusFilter(e.target.value);
//             setPage(1);
//           }}
//         >
//           <option value="ALL">All Status</option>
//           <option value="ACTIVE">Active</option>
//           <option value="INACTIVE">Inactive</option>
//         </select>

//         <input
//           placeholder="Filter by recruiter"
//           className="border rounded-lg px-3 py-2 text-sm"
//           value={recruiterFilter}
//           onChange={(e) => {
//             setRecruiterFilter(e.target.value);
//             setPage(1);
//           }}
//         />

//         <input
//           placeholder="Filter by category"
//           className="border rounded-lg px-3 py-2 text-sm"
//           value={categoryFilter}
//           onChange={(e) => {
//             setCategoryFilter(e.target.value);
//             setPage(1);
//           }}
//         />

//         <button
//           onClick={() => {
//             setStatusFilter("ALL");
//             setRecruiterFilter("");
//             setCategoryFilter("");
//             setPage(1);
//           }}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-00"
//         >
//           Clear
//         </button>
//       </div>

//       {/* =======================
//           TABLE
//       ======================= */}
//       <div className="bg-white border rounded-xl overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-100 text-left">
//             <tr>
//               <th className="p-3">Job ID</th>
//               <th className="p-3">Recruiter</th>
//               <th className="p-3">Category</th>
//               <th className="p-3">Title</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Created</th>
//               <th className="p-3 text-center">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading ? (
//               <tr>
//                 <td
//                   colSpan={7}
//                   className="p-6 text-center text-gray-400"
//                 >
//                   Loading jobs…
//                 </td>
//               </tr>
//             ) : paginatedJobs.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={7}
//                   className="p-6 text-center text-gray-400"
//                 >
//                   No jobs found
//                 </td>
//               </tr>
//             ) : (
//               paginatedJobs.map((job) => (
//                 <tr
//                   key={job.id}
//                   className="border-t hover:bg-gray-50"
//                 >
//                   <td className="p-3">{job.id}</td>
//                   <td className="p-3 font-medium">
//                     {job.createdByName}
//                   </td>
//                   <td className="p-3">{job.categoryName}</td>
//                   <td className="p-3">{job.title}</td>
//                   <td
//                     className={`p-3 font-semibold ${
//                       job.active
//                         ? "text-green-700"
//                         : "text-red-700"
//                     }`}
//                   >
//                     {job.active ? "ACTIVE" : "INACTIVE"}
//                   </td>
//                   <td className="p-3">
//                     {new Date(job.createdAt).toLocaleString()}
//                   </td>
//                   <td className="p-3 text-center">
//                     {job.active ? (
//                       <button
//                         onClick={() => handleDeactivate(job.id)}
//                         className="px-3 py-1 rounded-md border border-red-300 bg-red-50 text-red-700 text-xs"
//                       >
//                         Deactivate
//                       </button>
//                     ) : (
//                       <button
//                         onClick={() => handleActivate(job.id)}
//                         className="px-3 py-1 rounded-md border border-green-300 bg-green-50 text-green-700 text-xs"
//                       >
//                         Activate
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* =======================
//           PAGINATION + RECORDS
//       ======================= */}
//       <div className="flex justify-between items-center mt-4 text-sm">
//         <span>
//           Showing{" "}
//           {totalRecords === 0
//             ? 0
//             : (page - 1) * PAGE_SIZE + 1}
//           –
//           {Math.min(page * PAGE_SIZE, totalRecords)} of{" "}
//           {totalRecords} records
//         </span>

//         <div className="flex gap-2">
//           <button
//             disabled={page === 1}
//             onClick={() => setPage((p) => p - 1)}
//             className="px-3 py-1 border rounded disabled:opacity-40"
//           >
//             Prev
//           </button>
//           <button
//             disabled={page === totalPages || totalPages === 0}
//             onClick={() => setPage((p) => p + 1)}
//             className="px-3 py-1 border rounded disabled:opacity-40"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminJobsPage;



// import { useEffect, useState } from "react";
// import { getAdminJobs, deactivateJob, activateJob } from "../../api/adminApi";

// const AdminJobsPage = () => {
//     const [jobs, setJobs] = useState([]);

//     useEffect(() => {
//         getAdminJobs().then(res => {
//             console.log("ADMIN JOBS API RESPONSE:", res.data);
//             setJobs(res.data);
//         });
//     }, []);
//     const handleActivate = async (jobId) => {
//         await activateJob(jobId);
//         const res = await getAdminJobs();
//         setJobs(res.data);
//     };

//     const handleDeactivate = async (jobId) => {
//         await deactivateJob(jobId);
//         const res = await getAdminJobs();
//         setJobs(res.data);
//     };
// return (
//   <div
//     style={{
//       padding: "40px 24px",
//       maxWidth: "1200px",
//       margin: "0 auto",
//     }}
//   >

//     <h2 className="text-2xl font-semibold">Jobs Page</h2>
//     <p className="text-sm text-gray-500 mb-10">
//       System-wide Jobs created by Recruiters
//     </p>

//     <div
//       style={{
//         border: "1px solid #e5e7eb",
//         borderRadius: "12px",
//         overflow: "hidden",
//         background: "#ffffff",
//       }}
//     >
//       <table
//         width="100%"
//         style={{
//           borderCollapse: "collapse",
//           fontSize: "14px",
//         }}
//       >
//         <thead style={{ background: "#f9fafb" }}>
//           <tr>
//             {[
//               "Job ID",
//               "Recruiter",
//               "Category",
//               "Title",
//               "Status",
//               "Created",
//               "Action",
//             ].map((h) => (
//               <th
//                 key={h}
//                 style={{
//                   padding: "12px",
//                   textAlign: "left",
//                   borderBottom: "1px solid #e5e7eb",
//                   color: "#374151",
//                   fontWeight: 600,
//                 }}
//               >
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>
//           {Array.isArray(jobs) &&
//             jobs.map((job, index) => (
//               <tr
//                 key={job.id}
//                 style={{
//                   background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
//                 }}
//               >
//                 <td style={cell}>{job.id}</td>
//                 <td style={cell}>{job.createdByName}</td>
//                 <td style={cell}>{job.categoryName}</td>
//                 <td style={cell}>{job.title}</td>

//                 {/* STATUS */}
//                 <td
//                   style={{
//                     ...cell,
//                     fontWeight: 600,
//                     color: job.active ? "#065f46" : "#7c2d12",
//                   }}
//                 >
//                   {job.active ? "ACTIVE" : "INACTIVE"}
//                 </td>

//                 <td style={cell}>
//                   {new Date(job.createdAt).toLocaleString()}
//                 </td>

//                 {/* ACTION */}
//                 <td style={cell}>
//                   {job.active ? (
//                     <button
//                       onClick={() => handleDeactivate(job.id)}
//                       style={dangerBtn}
//                     >
//                       Deactivate
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => handleActivate(job.id)}
//                       style={successBtn}
//                     >
//                       Activate
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// };
// export default AdminJobsPage;

// const cell = {
//   padding: "12px",
//   borderBottom: "1px solid #e5e7eb",
//   verticalAlign: "middle",
// };

// const dangerBtn = {
//   padding: "6px 12px",
//   borderRadius: "6px",
//   border: "1px solid #dc2626",
//   background: "#fee2e2",
//   color: "#991b1b",
//   cursor: "pointer",
// };

// const successBtn = {
//   padding: "6px 12px",
//   borderRadius: "6px",
//   border: "1px solid #16a34a",
//   background: "#dcfce7",
//   color: "#166534",
//   cursor: "pointer",
// };
