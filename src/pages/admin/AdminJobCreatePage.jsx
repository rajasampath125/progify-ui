import { useEffect, useState } from "react";
import api from "../../api/axios";

function AdminJobCreatePage() {
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
      const response = await api.get("/admin/users/candidates");
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

  const handleCreateJob = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!selectedCandidate) return setSubmitError("Please select a candidate");
    if (!jobTitle || !jobDescription || !jobLink)
      return setSubmitError("All job fields are required");
    if (!resumeFile)
      return setSubmitError("Resume (DOCX) is required");

    try {
      const jobForm = new FormData();
      jobForm.append("candidateId", selectedCandidate.id);
      jobForm.append("title", jobTitle);
      jobForm.append("description", jobDescription);
      jobForm.append("jobLink", jobLink);
      jobForm.append("resume", resumeFile);

      const jobResponse = await api.post("/jobs", jobForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const jobId = jobResponse.data.id;
      const resumeForm = new FormData();
      resumeForm.append("file", resumeFile);

      await api.post(`/internal/jobs/${jobId}/resume`, resumeForm);

      setSubmitSuccess("Job created successfully");
      setJobTitle("");
      setJobDescription("");
      setJobLink("");
      setResumeFile(null);
      setSelectedCandidate(null);
    } catch {
      setSubmitError("Failed to create job");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <a
        href="/admin/dashboard"
        className="text-blue-600 text-sm mb-4 inline-block"
      >
        ← Back to Dashboard
      </a>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Create Job</h1>

        {/* Candidate */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Candidate
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            onChange={handleCandidateChange}
            defaultValue=""
          >
            <option value="">Select candidate</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name && c.name !== "null" ? c.name : c.email}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Category
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            disabled
            value={selectedCandidate?.category || ""}
            placeholder="Auto-filled"
          />
        </div>

        {/* Job Title */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Job Title
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter job title"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Job Description
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter job description"
          />
        </div>

        {/* Job Link */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Job Link
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
            placeholder="External job link"
          />
        </div>

        {/* Resume */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Resume (DOCX)
          </label>
          <input type="file" accept=".docx" onChange={handleResumeChange} />
          {resumeError && (
            <p className="text-sm text-red-600 mt-1">{resumeError}</p>
          )}
          {resumeFile && (
            <p className="text-sm text-green-600 mt-1">
              {resumeFile.name}
            </p>
          )}
        </div>

        {/* Feedback */}
        {submitError && (
          <p className="text-sm text-red-600 mb-3">{submitError}</p>
        )}
        {submitSuccess && (
          <p className="text-sm text-green-600 mb-3">
            {submitSuccess}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCreateJob}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Job
          </button>
          <button
            onClick={() => (window.location.href = "/admin/jobs")}
            className="border px-5 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminJobCreatePage;
