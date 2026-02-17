import { useEffect, useState } from "react";
import axios from "axios";
import { getCandidateUsers } from "../../api/recruiterApi";

const RecruiterJobCreatePage = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const response = await getCandidateUsers();
      setCandidates(response.data);
    } catch (error) {
      console.error("Failed to load candidates", error);
    }
  };

  const handleCandidateChange = (e) => {
    const candidateId = e.target.value;
    const candidate = candidates.find((c) => c.id === candidateId);
    setSelectedCandidate(candidate);
  };

  const handleCreateJob = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!selectedCandidate) {
      setSubmitError("Please select a candidate");
      return;
    }

    if (!jobTitle || !jobDescription || !jobLink) {
      setSubmitError("All job fields are required");
      return;
    }

    if (!resumeFile) {
      setSubmitError("Resume (DOCX) is required");
      return;
    }

    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const token = auth?.token;

      const jobFormData = new FormData();
      jobFormData.append("candidateId", selectedCandidate.id);
      jobFormData.append("title", jobTitle);
      jobFormData.append("description", jobDescription);
      jobFormData.append("jobLink", jobLink);

      const jobRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/jobs`,
        jobFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const jobId = jobRes.data.id;

      const resumeFormData = new FormData();
      resumeFormData.append("file", resumeFile);

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/internal/jobs/${jobId}/resume`,
        resumeFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmitSuccess("Job created successfully");
      setJobTitle("");
      setJobDescription("");
      setJobLink("");
      setResumeFile(null);
      setSelectedCandidate(null);
    } catch (error) {
      console.error("Failed to create job", error);
      setSubmitError("Failed to create job");
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (file.type !== allowedType) {
      setResumeError("Only DOCX files are allowed");
      setResumeFile(null);
      return;
    }

    setResumeError("");
    setResumeFile(file);
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "24px",
      }}
    >
      <h1 style={{ marginBottom: "8px" }}>Create Job</h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Create a new job and assign it to a candidate
      </p>

      <div style={card}>
        {/* Candidate */}
        <Field label="Candidate">
          <select style={input} onChange={handleCandidateChange} defaultValue="">
            <option value="">Select Candidate</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name && c.name !== "null" ? c.name : c.email}
              </option>
            ))}
          </select>
        </Field>

        {/* Category */}
        <Field label="Category">
          <input
            style={{ ...input, background: "#f9fafb" }}
            value={selectedCandidate?.category || ""}
            disabled
            placeholder="Auto-filled"
          />
        </Field>

        {/* Title */}
        <Field label="Job Title">
          <input
            style={input}
            placeholder="Enter job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </Field>

        {/* Description */}
        <Field label="Job Description">
          <textarea
            style={{ ...input, minHeight: "120px" }}
            placeholder="Enter job description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </Field>

        {/* Job Link */}
        <Field label="Job Link">
          <input
            style={input}
            placeholder="Enter external job link"
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
          />
        </Field>

        {/* Resume */}
        <Field label="Resume (DOCX)">
          <input type="file" accept=".docx" onChange={handleResumeChange} />
          {resumeError && <p style={{ color: "red" }}>{resumeError}</p>}
          {resumeFile && (
            <p style={{ color: "#166534" }}>{resumeFile.name}</p>
          )}
        </Field>

        {submitError && <p style={{ color: "red" }}>{submitError}</p>}
        {submitSuccess && <p style={{ color: "#166534" }}>{submitSuccess}</p>}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <button style={secondaryBtn} onClick={() => history.back()}>
            Cancel
          </button>
          <button style={primaryBtn} onClick={handleCreateJob}>
            Create Job
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- UI Helpers ---------- */

const card = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "32px",
};

const Field = ({ label, children }) => (
  <div style={{ marginBottom: "20px" }}>
    <label style={{ fontSize: "14px", fontWeight: 600 }}>{label}</label>
    <div style={{ marginTop: "6px" }}>{children}</div>
  </div>
);

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
};

const primaryBtn = {
  padding: "10px 18px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "10px 18px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  fontSize: "14px",
  cursor: "pointer",
};

export default RecruiterJobCreatePage;