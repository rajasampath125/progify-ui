import { useEffect, useState } from "react";
import axios from "axios";
import { getCandidateUsers } from "../../api/recruiterApi";


const RecruiterJobCreatePage = () => {

  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");

  //SUBMIT JOB HANDLERS
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");


  useEffect(() => {
    loadCandidates();
  }, []);

  // LOAD THE CANDIDATES EMAIL FOR DROPDOWN
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
    console.log("HANDLE CREATE JOB CLICKED");

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

      /* ========================= */
      /* 1️⃣ CREATE JOB (NO RESUME) */
      /* ========================= */
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
      console.log("STEP 1 DONE, jobId =", jobId);

      /* =============================== */
      /* 2️⃣ UPLOAD / REPLACE RESUME */
      /* =============================== */
      console.log("STEP 2: uploading resume");

      const resumeFormData = new FormData();
      resumeFormData.append("fileName", resumeFile.name);
      resumeFormData.append("s3Key", "dummy-key-" + Date.now());

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/internal/jobs/${jobId}/resume`,
        resumeFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSubmitSuccess("Job and resume uploaded successfully");

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

  // DOCX-only resume handler
  const handleResumeChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setResumeFile(null);
      setResumeError("");
      return;
    }

    const allowedType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (file.type !== allowedType) {
      setResumeFile(null);
      setResumeError("Only DOCX files are allowed");
      return;
    }

    setResumeError("");
    setResumeFile(file);
  };


  return (
    <div className="container">
      <a href="/recruiter/dashboard">← Back to Dashboard</a>
      <h2>Create Job (Recruiter)</h2>


      {/* Candidate Selection */}
      <div>
        <label>Candidate</label>
        <br />
        <select onChange={handleCandidateChange} defaultValue="">
          <option value="">Select Candidate</option>
          {candidates.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name && candidate.name !== "null"
                ? candidate.name
                : candidate.email}
            </option>
          ))}
        </select>
      </div>

      <br />

      {/* Category (Read-only) */}
      <div>
        <label>Category</label>
        <br />
        <input
          type="text"
          value={selectedCandidate?.category || ""}
          disabled
          placeholder="Auto-filled"
        />
      </div>

      <br />

      {/* Job Title */}
      <div>
        <label>Job Title</label>
        <br />
        <input
          type="text"
          placeholder="Enter job title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />

      </div>

      <br />

      {/* Job Description */}
      <div>
        <label>Job Description</label>
        <br />
        <textarea
          placeholder="Enter job description"
          rows={5}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

      </div>

      <br />

      {/* Job Link */}
      <div>
        <label>Job Link</label>
        <br />
        <input
          type="text"
          placeholder="Enter external job link"
          value={jobLink}
          onChange={(e) => setJobLink(e.target.value)}
        />

      </div>

      <br />

      {/* Resume Upload */}
      <div>
        <label>Upload Resume (DOCX only)</label>
        <br />
        <input
          type="file"
          accept=".docx"
          onChange={handleResumeChange}
        />
        {resumeError && (
          <div style={{ color: "red" }}>{resumeError}</div>
        )}
        {resumeFile && (
          <div style={{ color: "green" }}>
            Selected file: {resumeFile.name}
          </div>
        )}
      </div>

      <br />


      {submitError && (
        <div style={{ color: "red" }}>{submitError}</div>
      )}

      {submitSuccess && (
        <div style={{ color: "green" }}>{submitSuccess}</div>
      )}

      {/* Actions */}
      <button onClick={handleCreateJob}>Create Job</button>
      <button
        style={{ marginLeft: "10px" }}
        onClick={() => (window.location.href = "/recruiter/jobs")}
      >
        Cancel
      </button>

    </div>
  );

};

export default RecruiterJobCreatePage;
