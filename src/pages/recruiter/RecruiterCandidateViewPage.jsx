import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCandidateById } from "../../api/recruiterApi";

const RecruiterCandidateViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    getCandidateById(id).then((res) => setCandidate(res.data));
  }, [id]);

  if (!candidate) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading candidate details...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "24px",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={backBtn}
      >
        ← Back
      </button>

      <h1 style={{ marginTop: "16px", marginBottom: "8px" }}>
        Candidate Details
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        View candidate information
      </p>

      <div style={card}>
        <Detail label="Name" value={candidate.name || "-"} />
        <Detail label="Email" value={candidate.email || "-"} />
        <Detail label="Category" value={candidate.category || "-"} />
      </div>
    </div>
  );
};

/* ===================== */
/* UI Helpers */
/* ===================== */

const card = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "28px",
};

const Detail = ({ label, value }) => (
  <div style={{ marginBottom: "18px" }}>
    <div
      style={{
        fontSize: "13px",
        color: "#6b7280",
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: "15px",
        fontWeight: 500,
        color: "#111827",
      }}
    >
      {value}
    </div>
  </div>
);

const backBtn = {
  background: "none",
  border: "none",
  color: "#2563eb",
  fontSize: "14px",
  cursor: "pointer",
  padding: 0,
};

export default RecruiterCandidateViewPage;
