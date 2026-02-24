import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getCandidateUsers } from "../../api/recruiterApi";
import {
  Check,
  ChevronsUpDown,
  Search,
  Upload,
  User,
  Briefcase,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X
} from "lucide-react";

const RecruiterJobCreatePage = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    loadCandidates();

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        // If they clicked away without selecting, revert search term to selected candidate or empty
        if (selectedCandidate) {
          setSearchTerm(selectedCandidate.name && selectedCandidate.name !== "null" ? selectedCandidate.name : selectedCandidate.email);
        } else {
          setSearchTerm("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedCandidate]);

  const loadCandidates = async () => {
    try {
      const response = await getCandidateUsers();
      setCandidates(response.data);
    } catch (error) {
      console.error("Failed to load candidates", error);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s))
    );
  });

  const handleSelectCandidate = (c) => {
    setSelectedCandidate(c);
    setSearchTerm(c.name && c.name !== "null" ? c.name : c.email);
    setIsDropdownOpen(false);
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

      if (jobRes.status === 201 || jobRes.status === 200) {
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

        setSubmitSuccess("Job created successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSubmitError("Failed to create job");
      }
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
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
        <p className="mt-1 text-sm text-gray-500">
          Post a new job and assign it to a candidate from your roster.
        </p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-6 sm:p-8">
          <div className="space-y-6">

            {/* === CANDIDATE SELECTION === */}
            <div>
              <label className="block text-sm font-semibold leading-6 text-gray-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  Candidate
                </span>
              </label>
              <div className="mt-1.5 relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    className="block w-full rounded-lg border-0 py-2.5 pl-9 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                    <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {isDropdownOpen && (
                  <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-xl ring-1 ring-gray-200 focus:outline-none sm:text-sm">
                    {filteredCandidates.length === 0 ? (
                      <li className="relative cursor-default select-none py-3 px-4 text-gray-500 text-sm">
                        No candidates found
                      </li>
                    ) : (
                      filteredCandidates.map((c) => {
                        const isSelected = selectedCandidate?.id === c.id;
                        return (
                          <li
                            key={c.id}
                            className={`relative cursor-pointer select-none py-2.5 pl-4 pr-9 border-b border-gray-50 last:border-0 transition-colors ${isSelected
                                ? 'bg-indigo-50 text-indigo-900'
                                : 'text-gray-900 hover:bg-gray-50'
                              }`}
                            onClick={() => handleSelectCandidate(c)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                                {(c.name && c.name !== 'null' ? c.name : c.email).charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`block truncate text-sm ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                                  {c.name && c.name !== "null" ? c.name : "Unknown Name"}
                                </span>
                                <span className="block truncate text-xs text-gray-500">{c.email}</span>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-600">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                          </li>
                        );
                      })
                    )}
                  </ul>
                )}
              </div>

              {/* Selected candidate chip */}
              {selectedCandidate && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                  <User className="w-3.5 h-3.5" />
                  {selectedCandidate.name && selectedCandidate.name !== 'null' ? selectedCandidate.name : selectedCandidate.email}
                  <button
                    type="button"
                    onClick={() => { setSelectedCandidate(null); setSearchTerm(''); }}
                    className="text-indigo-400 hover:text-indigo-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* === CATEGORY (auto-filled) === */}
            <div>
              <label className="block text-sm font-semibold leading-6 text-gray-900 mb-1">
                Category <span className="text-gray-400 font-normal text-xs">(Auto-filled from candidate)</span>
              </label>
              <input
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-500 bg-gray-50 ring-1 ring-inset ring-gray-200 sm:text-sm sm:leading-6 cursor-not-allowed"
                disabled
                value={selectedCandidate?.category || ""}
                placeholder="Select a candidate first"
              />
            </div>

            {/* === JOB TITLE === */}
            <div>
              <label className="block text-sm font-semibold leading-6 text-gray-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Job Title
                </span>
              </label>
              <input
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            {/* === JOB DESCRIPTION === */}
            <div>
              <label className="block text-sm font-semibold leading-6 text-gray-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Job Description
                </span>
              </label>
              <textarea
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-none"
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Enter the job requirements and responsibilities..."
              />
            </div>

            {/* === JOB LINK === */}
            <div>
              <label className="block text-sm font-semibold leading-6 text-gray-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-indigo-600" />
                  Job Link
                </span>
              </label>
              <input
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://company.com/careers/job-123"
              />
            </div>

            {/* === RESUME UPLOAD === */}
            <div>
              <label className="block text-sm font-semibold leading-6 text-gray-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  Resume <span className="text-gray-400 font-normal text-xs">(.docx only)</span>
                </span>
              </label>
              <div className="mt-1.5">
                <label className={`group flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${resumeFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'
                  }`}>
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleResumeChange}
                    className="sr-only"
                  />
                  {resumeFile ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-sm font-semibold text-green-700">{resumeFile.name}</p>
                      <p className="text-xs text-green-600 mt-0.5">Click to replace</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                      <p className="text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">Click to upload resume</p>
                      <p className="text-xs text-gray-400 mt-0.5">DOCX files only</p>
                    </>
                  )}
                </label>

                {resumeError && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {resumeError}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center border-t border-gray-100 px-6 py-4 bg-gray-50 rounded-b-xl gap-4">
          {submitError && (
            <div className="flex items-center gap-2 text-sm text-red-600 flex-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 flex-1">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {submitSuccess}
            </div>
          )}
          <div className="ml-auto">
            <button
              type="button"
              onClick={handleCreateJob}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Create Job
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecruiterJobCreatePage;