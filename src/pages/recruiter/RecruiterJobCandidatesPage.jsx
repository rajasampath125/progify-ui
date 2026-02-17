/*
Purpose:
Shows candidates for ONE specific job
One row = one candidate
*/

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobCandidates } from "../../api/recruiterApi";

const RecruiterJobCandidatesPage = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getJobCandidates(jobId);
      setCandidates(res.data);
    } catch (err) {
      console.error("Failed to load job candidates", err);
      setError("Failed to load candidates for this job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 24px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <button
        onClick={() => navigate("/recruiter/jobs")}
        style={backBtn}
      >
        ← Back to Jobs
      </button>

      <h1 style={{ marginTop: "16px", marginBottom: "8px" }}>
        Job Candidates
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Candidates assigned to this job
      </p>

      {loading && <p>Loading candidates...</p>}

      {!loading && error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {!loading && !error && candidates.length === 0 && (
        <p>No candidates found for this job.</p>
      )}

      {!loading && candidates.length > 0 && (
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Applied At</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr
                  key={c.candidateId}
                  style={{ transition: "background 0.15s ease" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={tdStyle}>{c.candidateEmail}</td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background:
                          c.applicationStatus === "APPLIED"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          c.applicationStatus === "APPLIED"
                            ? "#166534"
                            : "#92400e",
                      }}
                    >
                      {c.applicationStatus === "NOT_APPLIED"
                        ? "NOT APPLIED"
                        : c.applicationStatus}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    {c.appliedAt
                      ? new Date(c.appliedAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ===================== */
/* Styles */
/* ===================== */

const backBtn = {
  background: "none",
  border: "none",
  color: "#2563eb",
  fontSize: "14px",
  cursor: "pointer",
  padding: 0,
};

const tableWrapper = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  overflow: "hidden",
  background: "#ffffff",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
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
};

export default RecruiterJobCandidatesPage;
