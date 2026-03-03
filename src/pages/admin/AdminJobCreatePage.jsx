import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { Search, X, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

function AdminJobCreatePage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Searchable combobox state
  const [candidateSearch, setCandidateSearch] = useState("");
  const [comboOpen, setComboOpen] = useState(false);
  const comboRef = useRef(null);

  // Use a key to force-reset the file input DOM element after submission
  const [fileInputKey, setFileInputKey] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => { loadCandidates(); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (comboRef.current && !comboRef.current.contains(e.target)) setComboOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadCandidates = async () => {
    try {
      const response = await api.get("/admin/users/candidates");
      setCandidates(response.data);
    } catch (error) {
      console.error("Failed to load candidates", error);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const q = candidateSearch.toLowerCase();
    return (c.name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
  });

  const selectCandidate = (c) => {
    setSelectedCandidateId(c.id);
    setSelectedCandidate(c);
    setCandidateSearch(c.name && c.name !== "null" ? c.name : c.email);
    setComboOpen(false);
  };

  const clearCandidate = () => {
    setSelectedCandidateId("");
    setSelectedCandidate(null);
    setCandidateSearch("");
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (file.type !== allowedType) { setResumeError("Only DOCX files are allowed"); setResumeFile(null); return; }
    setResumeError(""); setResumeFile(file);
  };

  const resetForm = () => {
    clearCandidate();
    setJobTitle(""); setJobDescription(""); setJobLink("");
    setResumeFile(null); setResumeError("");
    setFileInputKey((k) => k + 1);
  };

  const handleCreateJob = async () => {
    setSubmitError(""); setSubmitSuccess("");
    if (!selectedCandidate) return setSubmitError("Please select a candidate");
    if (!jobTitle || !jobDescription || !jobLink) return setSubmitError("All job fields are required");
    if (!resumeFile) return setSubmitError("Resume (DOCX) is required");
    try {
      const jobForm = new FormData();
      jobForm.append("candidateId", selectedCandidate.id);
      jobForm.append("title", jobTitle);
      jobForm.append("description", jobDescription);
      jobForm.append("jobLink", jobLink);
      jobForm.append("resume", resumeFile);
      const jobResponse = await api.post("/jobs", jobForm, { headers: { "Content-Type": "multipart/form-data" } });
      if (jobResponse.status === 201 || jobResponse.status === 200) {
        const jobId = jobResponse.data.id;
        const resumeForm = new FormData();
        resumeForm.append("file", resumeFile);
        await api.post(`/internal/jobs/${jobId}/resume`, resumeForm);
        setSubmitSuccess("Job created successfully!");
        setTimeout(() => { window.location.reload(); }, 1500);
      } else { setSubmitError("Failed to create job"); }
    } catch { setSubmitError("Failed to create job"); }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <a href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </a>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="max-w-2xl">
            <h1 className="text-base font-semibold leading-7 text-gray-900">Create New Job</h1>
            <p className="mt-1 text-sm leading-6 text-gray-500">Assign a new role to a candidate. All fields are required.</p>

            <div className="mt-8 space-y-6">
              {/* ── Searchable Candidate Combobox ── */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Candidate
                </label>
                <div className="mt-2 relative" ref={comboRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="Search by name or email…"
                      value={candidateSearch}
                      onChange={(e) => { setCandidateSearch(e.target.value); setComboOpen(true); if (!e.target.value) clearCandidate(); }}
                      onFocus={() => setComboOpen(true)}
                      className={`block w-full rounded-md border-0 py-2 pl-9 pr-9 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${selectedCandidate ? "ring-indigo-300 bg-indigo-50" : "ring-gray-300"}`}
                    />
                    {candidateSearch && (
                      <button onClick={clearCandidate} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown */}
                  {comboOpen && filteredCandidates.length > 0 && (
                    <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 text-sm">
                      {filteredCandidates.slice(0, 50).map((c) => (
                        <li
                          key={c.id}
                          onClick={() => selectCandidate(c)}
                          className={`flex items-center gap-3 cursor-pointer px-4 py-2.5 hover:bg-indigo-50 transition-colors ${c.id === selectedCandidateId ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-900"}`}
                        >
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs flex-shrink-0">
                            {(c.name || c.email)[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{c.name && c.name !== "null" ? c.name : c.email}</p>
                            {c.name && c.name !== "null" && <p className="text-xs text-gray-400 truncate">{c.email}</p>}
                          </div>
                        </li>
                      ))}
                      {filteredCandidates.length > 50 && (
                        <li className="px-4 py-2 text-xs text-gray-400 text-center border-t">
                          Showing 50 of {filteredCandidates.length} matches — type more to narrow results
                        </li>
                      )}
                    </ul>
                  )}
                  {comboOpen && candidateSearch && filteredCandidates.length === 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg bg-white py-3 px-4 shadow-lg ring-1 ring-black/5 text-sm text-gray-500">
                      No candidates match "{candidateSearch}"
                    </div>
                  )}
                </div>
              </div>

              {/* Category (auto-filled) */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Category <span className="text-gray-400 font-normal">(Auto-filled)</span>
                </label>
                <div className="mt-2">
                  <input
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-500 bg-gray-50 ring-1 ring-inset ring-gray-200 sm:text-sm sm:leading-6 cursor-not-allowed"
                    disabled value={selectedCandidate?.category || ""} placeholder="Select a candidate first"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Job Title
                </label>
                <div className="mt-2">
                  <input
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Job Description
                </label>
                <div className="mt-2">
                  <textarea
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Enter the job requirements and responsibilities..."
                  />
                </div>
              </div>

              {/* Job Link */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Job Link
                </label>
                <div className="mt-2">
                  <input
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={jobLink}
                    onChange={(e) => setJobLink(e.target.value)}
                    placeholder="https://company.com/careers/job-123"
                  />
                </div>
              </div>

              {/* Resume — key prop forces DOM reset on success */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Resume <span className="text-gray-400 font-normal">(.docx only)</span>
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <input
                    key={fileInputKey}
                    type="file"
                    accept=".docx"
                    onChange={handleResumeChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-colors"
                  />
                </div>
                {resumeError && (
                  <p className="text-sm text-red-600 mt-2">{resumeError}</p>
                )}
                {resumeFile && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    ✓ {resumeFile.name} attached
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-x-4 border-t border-gray-900/10 px-4 py-4 sm:px-8 bg-gray-50 rounded-b-xl">
          {submitError && (
            <p className="text-sm text-red-600 flex-1">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-sm font-medium text-green-600 flex-1">{submitSuccess}</p>
          )}
          <button
            type="button"
            onClick={() => (window.location.href = "/admin/jobs")}
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateJob}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            Create Job
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminJobCreatePage;
