import React, { useEffect, useState } from "react";
import { getRecruiterJobs } from "../../api/recruiterApi";
import { useNavigate } from "react-router-dom";

/**
 * RecruiterDashboardPage
 *
 * Responsibilities:
 * - Display recruiter-scoped job metrics
 * - Provide navigation entry points for recruiter actions
 *
 * Rules:
 * - Read-only
 * - No forms
 * - Recruiter data ONLY
 * - Admin-style UI consistency
 */
const RecruiterDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getRecruiterJobs()
      .then((res) => setJobs(res.data || []))
      .catch((err) =>
        console.error("Failed to load recruiter jobs", err)
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Recruiter Dashboard</h1>
        <p>Loading metrics...</p>
      </div>
    );
  }

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.active).length;
  const inactiveJobs = totalJobs - activeJobs;

  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )
    .slice(0, 5);

  return (
    <div
      style={{
        padding: "40px 24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <h1 style={{ marginBottom: "32px" }}>
        Recruiter Dashboard
      </h1>

      {/* Metrics Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        <MetricCard title="Total Jobs" value={totalJobs} />
        <MetricCard title="Active Jobs" value={activeJobs} />
        <MetricCard title="Inactive Jobs" value={inactiveJobs} />
      </div>

      {/* Actions Section */}
      <h2 style={{ marginBottom: "16px" }}>
        What would you like to do?
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        <ActionLink
          href="/recruiter/jobs/create"
          title="Create Jobs"
          description="Create a new job and assign it to a candidate"
        />
        <ActionLink
          href="/recruiter/jobs"
          title="Jobs List"
          description="View, activate, or deactivate job postings"
        />
      </div>

      {/* Recent Jobs */}
      <h2 style={{ marginBottom: "16px" }}>
        Recent Jobs
      </h2>

      {recentJobs.length === 0 && (
        <p>No jobs created yet.</p>
      )}

      {recentJobs.length > 0 && (
        <table
          width="100%"
          style={{
            borderCollapse: "collapse",
            background: "#ffffff",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Created At</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.map((job) => (
              <tr key={job.id}>
                <td style={tdStyle}>{job.title}</td>
                <td style={tdStyle}>
                  {job.active ? "Active" : "Inactive"}
                </td>
                <td style={tdStyle}>
                  {new Date(job.createdAt).toLocaleString()}
                </td>
                <td style={tdStyle}>
                  {/* <a href={`/recruiter/jobs/${job.id}/candidates`}>
                    View Candidates
                  </a> */}
                  <button
                    onClick={() =>
                      navigate(`/recruiter/jobs/${job.id}/candidates`)
                    }
                    style={linkBtn}
                  >
                    View Candidates
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
};

/* ===================== */
/* Local UI Components   */
/* ===================== */
function MetricCard({ title, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "24px",
        textAlign: "center",
        boxShadow: "0 6px 14px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: "14px", color: "#6b7280" }}>
        {title}
      </div>
      <div
        style={{
          fontSize: "32px",
          fontWeight: 600,
          marginTop: "10px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionLink({ href, title, description }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "24px",
        background: "#ffffff",
        color: "#111827",
      }}
    >
      <h3 style={{ marginBottom: "8px" }}>{title}</h3>
      <p style={{ margin: 0, color: "#6b7280" }}>
        {description}
      </p>
    </a>
  );
}


const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};

const thStyle = {
  padding: "14px",
  textAlign: "left",
  background: "#f9fafb",
  fontSize: "14px",
  fontWeight: 600,
  color: "#374151",
};

const tdStyle = {
  padding: "12px 14px",
  fontSize: "14px",
  borderTop: "1px solid #e5e7eb",
  verticalAlign: "middle",
};

const linkBtn = {
  background: "none",
  border: "none",
  color: "#2563eb",
  cursor: "pointer",
  padding: 0,
  fontSize: "14px",
};


export default RecruiterDashboardPage;
