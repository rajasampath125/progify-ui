import { useEffect, useState } from "react";
import { getCandidateSummary, getCurrentCandidate } from "../../api/candidateApi";
import { Link } from "react-router-dom";

/**
 * CandidateDashboardPage
 *
 * Responsibilities:
 * - Show candidate activity summary
 * - Entry point for candidate actions
 *
 * Rules:
 * - Read-only
 * - No tables
 * - No forms
 */
const CandidateDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = JSON.parse(localStorage.getItem("auth"));
  const name = auth?.name || "there";

  useEffect(() => {
    getCandidateSummary()
      .then((res) => setSummary(res.data))
      .catch((err) =>
        console.error("Failed to load candidate summary", err)
      )
      .finally(() => setLoading(false));
  }, []);

  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getCurrentCandidate()
      .then((res) => setProfile(res.data))
      .catch(() => { });
  }, []);

  if (loading || !summary) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Candidate Dashboard</h1>
        <p>Loading summary...</p>
      </div>

    );
  }

  return (
    <div
      style={{
        padding: "40px 24px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <h1 style={{ marginBottom: "32px" }}>
        Candidate Dashboard
      </h1>

      {/* Welcome Message */}
      <h2 style={{ marginBottom: 8 }}>Hi {profile?.name || "there"}, thrilled to have you here!</h2>
      <p style={{ color: "#56595f" }}>Here’s what’s happening with your job applications today.</p>

      {/* Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        <MetricCard
          title="Assigned Jobs"
          value={summary.totalAssigned}
        />
        <MetricCard
          title="Applied Jobs"
          value={summary.totalApplied}
        />
        <MetricCard
          title="Pending Applications"
          value={summary.totalNotApplied}
        />
      </div>

      {/* Actions */}
      <h2 style={{ marginBottom: "16px" }}>
        What would you like to do?
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        <ActionLink
          to="/candidate/jobs"
          title="My Jobs"
          description="View assigned jobs and apply"
        />
        <ActionLink
          to="/candidate/jobs/history"
          title="Job History"
          description="View your job activity history"
        />
      </div>
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
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "14px", color: "#6b7280" }}>
        {title}
      </div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: "600",
          marginTop: "8px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionLink({ to, title, description }) {
  return (
    <Link
      to={to}
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
    </Link>
  );
}


export default CandidateDashboardPage;
