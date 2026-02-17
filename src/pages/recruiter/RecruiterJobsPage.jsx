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
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getRecruiterJobs,
  deactivateRecruiterJob, activateRecruiterJob
} from "../../api/recruiterApi";
import { useSearchParams } from "react-router-dom";

const RecruiterJobsPage = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [creatorFilter, setCreatorFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date"); // YYYY-MM-DD


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



  const creators = [
    "ALL",
    ...new Set(jobs.map(j => j.createdByName).filter(Boolean)),
  ];

  // const filteredJobs = jobs.filter((job) => {
  //   const matchesSearch =
  //     job.title.toLowerCase().includes(search.toLowerCase());

  //   const matchesStatus =
  //     statusFilter === "ALL" ||
  //     (statusFilter === "ACTIVE" && job.active) ||
  //     (statusFilter === "INACTIVE" && !job.active);

  //   const matchesCreator =
  //     creatorFilter === "ALL" ||
  //     job.createdByName === creatorFilter;

  //   return matchesSearch && matchesStatus && matchesCreator;
  // });

  const filteredJobs = jobs.filter((job) => {
    // DATE FILTER FROM ANALYTICS
    if (dateParam) {
      const jobDate = new Date(job.createdAt)
        .toISOString()
        .split("T")[0]; // YYYY-MM-DD

      if (jobDate !== dateParam) return false;
    }

    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase());

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
    <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto", }}>
      {/* <a href="/recruiter/dashboard">← Back to Dashboard</a> */}
      <button
        onClick={() => navigate("/recruiter/analytics")}
        style={{
          marginBottom: "12px",
          fontSize: "13px",
          color: "#2563eb",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← Back to Analytics
      </button>

      <h2>All Jobs</h2>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
        This page shows all jobs created or managed the team.
        It supports filtering by status, creator, and creation date
        to help you quickly review, manage, and take action on jobs.
      </p>
      {dateParam && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: "12px",
            borderRadius: "8px",
            background: "#eff6ff",
            color: "#1d4ed8",
            fontSize: "13px",
          }}
        >
          Showing jobs created on <strong>{dateParam}</strong>
          {/* <button
            onClick={() => navigate("/recruiter/jobs")}
            style={{ marginLeft: "8px", cursor: "pointer", textDecoration: "underline" }}
          >
            Clear date filter
          </button> */}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "12px",
          margin: "16px 0",
          padding: "16px",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Search job title"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={filterInput}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={filterSelect}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <select
          value={creatorFilter}
          onChange={(e) => {
            setCreatorFilter(e.target.value);
            setPage(1);
          }}
          style={filterSelect}
        >
          {creators.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateParam || ""}
          onChange={(e) => {
            const value = e.target.value;

            if (value) {
              navigate(`/recruiter/jobs?date=${value}`);
            } else {
              navigate("/recruiter/jobs");
            }

            setPage(1);
          }}
          style={filterInput}
        />


        {/* CLEAR BUTTON */}
        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("ALL");
            setCreatorFilter("ALL");
            navigate("/recruiter/jobs");
          }}
          style={clearBtn}
        >
          Clear
        </button>
      </div>

      {/* <button onClick={() => navigate("/recruiter/jobs/create")}>
        + Create Job
      </button> */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* LEFT: filters */}
        <div style={{ display: "flex", gap: "12px" }}>
          {/* existing inputs here */}
        </div>

        {/* RIGHT: create job */}
        <button
          onClick={() => navigate("/recruiter/jobs/create")}
          style={createJobBtn}
        >
          + Create Job
        </button>
      </div>

      {/* <br /><br /> */}

      {loading && <p>Loading jobs...</p>}

      {!loading && error && jobs.length === 0 && (
        <p style={{ color: "red" }}>{error}</p>
      )}


      {!loading && jobs.length === 0 && (
        <p>No jobs found.</p>
      )}

      {!loading && jobs.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "16px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {[
                "Title",
                "Category",
                "Status",
                "Created At",
                "Created By",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedJobs.map((job) => (
              <tr
                key={job.id}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >

                <td>{job.title}</td>
                <td>{job.categoryName}</td>
                {/* <td>{job.active ? "Active" : "Inactive"}</td> */}

                <td style={td}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: job.active ? "#dcfce7" : "#fee2e2",
                      color: job.active ? "#166534" : "#991b1b",
                    }}
                  >
                    {job.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>

                <td>
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleString()
                    : "-"}
                </td>
                <td>{job.createdByName || "—"}</td>
                {/* <td>
                  {job.updatedAt
                    ? new Date(job.updatedAt).toLocaleString()
                    : "-"}
                </td> */}
                <td>
                  {/* <button
                    onClick={() =>
                      navigate(`/recruiter/jobs/${job.id}/candidates`)
                    }
                  >
                    View Candidates
                  </button>

                  {job.active ? (
                    <button
                      style={{ marginLeft: "8px" }}
                      onClick={() => deactivateJob(job.id)}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      style={{ marginLeft: "8px" }}
                      onClick={() => activateJob(job.id)}
                    >
                      Activate
                    </button>
                  )} */}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      style={secondaryBtn}
                      onClick={() =>
                        navigate(`/recruiter/jobs/${job.id}/candidates`)
                      }
                    >
                      Candidates
                    </button>

                    <button
                      style={job.active ? dangerBtn : successBtn}
                      onClick={() =>
                        job.active
                          ? deactivateJob(job.id)
                          : activateJob(job.id)
                      }
                    >
                      {job.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
        }}
      >
        <div style={{ fontSize: "13px", color: "#6b7280" }}>
          Showing {(page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, filteredJobs.length)} of{" "}
          {filteredJobs.length}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Prev
          </button>
          <span>Page {page} of {totalPages || 1}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};


const td = {
  padding: "10px 14px",
  fontSize: "14px",
  verticalAlign: "middle",
};


const filterInput = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  minWidth: "220px",
};

const filterSelect = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  minWidth: "160px",
  background: "#fff",
};

const secondaryBtn = {
  padding: "6px 10px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  background: "#fff",
  fontSize: "13px",
  cursor: "pointer",
};

const dangerBtn = {
  padding: "6px 10px",
  borderRadius: "6px",
  border: "none",
  background: "#fee2e2",
  color: "#991b1b",
  fontSize: "13px",
  cursor: "pointer",
};

const successBtn = {
  padding: "6px 10px",
  borderRadius: "6px",
  border: "none",
  background: "#dcfce7",
  color: "#166534",
  fontSize: "13px",
  cursor: "pointer",
};

const createJobBtn = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const clearBtn = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  fontSize: "14px",
  cursor: "pointer",
  color: "#374151",
};

export default RecruiterJobsPage;
