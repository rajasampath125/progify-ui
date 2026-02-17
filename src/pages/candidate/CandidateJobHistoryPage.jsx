import { useEffect, useState } from "react";
import {
  getAllCandidateJobs,
  applyToJob,
  downloadResume,
} from "../../api/candidateApi";
import { useSearchParams } from "react-router-dom";

const CandidateJobHistoryPage = () => {
  const [jobs, setJobs] = useState([]);
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
  }, []);
  
  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllCandidateJobs();
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load candidate jobs", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // FILTERED JOBS (IMPORTANT)
  // =====================
  const filteredJobs = jobs.filter((job) => {
    const matchesTitle =
      job.title?.toLowerCase().includes(searchTitle.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (job.applicationStatus ?? "NOT_APPLIED") === statusFilter;

    const matchesDate =
      !dateFilter || job.appliedAt?.startsWith(dateFilter);

    return matchesTitle && matchesStatus && matchesDate;
  });

const handleDownload = async (jobId) => {
  try {
    const response = await downloadResume(jobId);

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // 🔹 Extract filename from backend header
    const contentDisposition = response.headers["content-disposition"];
    let fileName = "resume.docx";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match?.length === 2) {
        fileName = match[1];
      }
    }

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

  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalJobs);
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  const isMobile = window.innerWidth < 768;

  const updateUrl = (page, size) => {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("pageSize", size);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setSearchParams({ page: p, pageSize });
  };

  const changePageSize = (size) => {
    setSearchParams({ page: 1, pageSize: size });
  };

  return (
    <div
      style={{
        padding: "30px 40px",
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {/* <a href="/candidate/dashboard">← Back to Dashboard</a> */}

      <h2 style={{ margin: "24px 0" }}>All Jobs</h2>

      {loading && <p>Loading jobs...</p>}

      {!loading && error && jobs.length === 0 && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {!loading && jobs.length === 0 && (
        <p>No jobs assigned yet.</p>
      )}

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          padding: "16px",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Search by job title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          style={filterInput}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={filterSelect}
        >
          <option value="ALL">All Status</option>
          <option value="APPLIED">Applied</option>
          <option value="NOT_APPLIED">Not Applied</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={filterInput}
        />

        <button
          style={filterClearBtn}
          onClick={() => {
            setSearchTitle("");
            setStatusFilter("ALL");
            setDateFilter("");
          }}
        >
          Clear
        </button>
      </div>

      {/*DESKTOP VIEW */}
      {!loading && jobs.length > 0 && !isMobile && (
        <div >
          <table
            width="100%"
            style={{
              borderCollapse: "collapse",
              tableLayout: "fixed",
              border: "1px solid #e5e7eb",
              background: "#fff",
            }}
          ><colgroup>
              <col style={{ width: "180px" }} />
              <col style={{ width: "420px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "120px" }} />
            </colgroup>


            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <th style={th}>Title</th>
                <th style={th}>Description</th>
                <th style={th}>Job Link</th>
                <th style={th}>Status</th>
                <th style={th}>Applied At</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedJobs.map((job) => (
                <tr key={job.jobId}
                  style={{
                    lineHeight: "1.6",
                    transition: "background 0.2s ease",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={td}>{job.title}</td>
                  <td style={{ ...td, maxWidth: "420px" }}>
                    <div
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: "1.6",
                        color: "#374151",
                      }}
                    >
                      {job.description}
                      {selectedJob && (
                        <div
                          style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1000,
                          }}
                          onClick={() => setSelectedJob(null)}
                        >
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              background: "#fff",
                              padding: "24px",
                              borderRadius: "12px",
                              maxWidth: "700px",
                              maxHeight: "80vh",
                              overflowY: "auto",
                              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                            }}
                          >
                            <h3 style={{ marginBottom: "12px" }}>{selectedJob.title}</h3>

                            <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                              {selectedJob.description}
                            </p>

                            <div style={{ textAlign: "right", marginTop: "20px" }}>
                              <button
                                onClick={() => setSelectedJob(null)}
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: "6px",
                                  background: "#2563eb",
                                  color: "#fff",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                    {job.description && job.description.length > 200 && (
                      <button
                        onClick={() => setSelectedJob(job)}
                        style={{
                          marginTop: "6px",
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          cursor: "pointer",
                          fontSize: "13px",
                          padding: 0,
                        }}
                      >
                        View more
                      </button>
                    )}
                  </td>


                  <td style={td}>
                    {job.jobLink && job.jobLink !== "N/A" ? (
                      <a
                        href={job.jobLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#2563eb",
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        JobLink
                      </a>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>N/A</span>
                    )}
                  </td>

                  <td style={{ verticalAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",   // 🔑 important
                        minHeight: "24px",          // 🔑 stabilizes row
                        paddingTop: "2px",          // visual alignment
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          minWidth: "90px",
                          textAlign: "center",
                          background:
                            (job.applicationStatus ?? "NOT_APPLIED") === "APPLIED"
                              ? "#dcfce7"
                              : "#fef3c7",
                          color:
                            (job.applicationStatus ?? "NOT_APPLIED") === "APPLIED"
                              ? "#166534"
                              : "#374151",
                        }}
                      >
                        {(job.applicationStatus ?? "NOT_APPLIED").replaceAll("_", " ")}
                      </span>
                    </div>
                  </td>

                  <td style={td}>
                    {job.appliedAt
                      ? new Date(job.appliedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td style={td}>
                    <button
                      style={secondaryBtn}
                      onClick={() => handleDownload(job.jobId)}
                    >    <i className="fa fa-download" style={{ marginRight: 6 }} />
                      Resume
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* MOBILE BLOCK START */}
          {!loading && jobs.length > 0 && isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {jobs.map((job) => (
                <div
                  key={job.jobId}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "14px",
                    background: "#fff",
                  }}
                >
                  {/* TITLE */}
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>
                    {job.title}
                  </div>

                  {/* STATUS */}
                  <div style={{ marginTop: "6px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background:
                          job.applicationStatus === "APPLIED"
                            ? "#fef3c7"
                            : "#dcfce7",
                        color:
                          job.applicationStatus === "APPLIED"
                            ? "#166534"
                            : "#374151",
                      }}
                    >
                      {job.applicationStatus}
                    </span>
                  </div>

                  {/* DESCRIPTION */}
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    {job.description?.slice(0, 120)}
                    {job.description?.length > 120 && "..."}
                  </div>

                  {/* META */}
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
                    Applied:{" "}
                    {job.appliedAt
                      ? new Date(job.appliedAt).toLocaleDateString()
                      : "-"}
                  </div>

                  {/* ACTIONS */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "12px",
                    }}
                  >
                    {job.jobLink && job.jobLink !== "N/A" && (
                      <a
                        href={job.jobLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "13px",
                          color: "#2563eb",
                          textDecoration: "none",
                        }}
                      >
                        View Job
                      </a>
                    )}

                    <button
                      style={{
                        padding: "6px 10px",
                        background: "#374151",
                        color: "#fff",
                        borderRadius: "6px",
                        border: "none",
                        fontSize: "13px",
                      }}
                      onClick={() => handleDownload(job.jobId)}
                    >
                      Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}


          {/* MOBILE BLOCK END */}
          {/* PAGINATION START*/}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              gap: "12px",
              flexWrap: "wrap",

              /* MOBILE STICKY  */
              position: isMobile ? "sticky" : "static",
              bottom: isMobile ? 0 : "auto",
              background: isMobile ? "#ffffff" : "transparent",
              padding: isMobile ? "12px" : 0,
              borderTop: isMobile ? "1px solid #e5e7eb" : "none",
              zIndex: 10,
            }}
          >
            {/* LEFT — COUNT */}
            <div style={{ fontSize: "13px", color: "#6b7280" }}>
              Showing {startIndex + 1}–{endIndex} of {totalJobs} jobs
            </div>

            {/* CENTER — PAGINATION */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
              >
                Prev
              </button>

              <span style={{ fontSize: "13px" }}>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </button>
            </div>

            {/* RIGHT — PAGE JUMP + PAGE SIZE */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px" }}>Go to</span>

              <input
                type="number"
                min="1"
                max={totalPages}
                value={page}
                onChange={(e) => goToPage(Number(e.target.value))}
                style={{ width: "60px", padding: "4px" }}
              />

              <select
                value={pageSize}
                onChange={(e) => changePageSize(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
          {/* PAGINATION END*/}
        </div>
      )}
    </div>
  );
};

/* ===================== */
/* Styles */
/* ===================== */

const th = {
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  fontSize: "16px",
};

const td = {
  padding: "18px 14px",
  fontSize: "14px",
  lineHeight: "1.6",
};

const primaryBtn = {
  padding: "6px 12px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "6px 12px",
  background: "#374151",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const paginationBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
};

const filterInput = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  minWidth: "200px",
};

const filterSelect = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  minWidth: "160px",
  background: "#fff",
};

const filterClearBtn = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  cursor: "pointer",
  fontSize: "14px",
};


export default CandidateJobHistoryPage;