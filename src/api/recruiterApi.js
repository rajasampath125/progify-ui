import api from "./axios";

/* ===================== */
/* RECRUITER (PROFILE)   */
/* ===================== */

export const getCurrentRecruiter = () => {
  return api.get("/recruiter/me");
};

/* ================================ */
/* RECRUITER (CANDIDATES LIST)      */
/* ================================ */

export const getAllCandidatesForRecruiter = () => {
  return api.get("/admin/users/candidates");
};

export const getCandidateById = (id) => {
  return api.get(`/recruiter/candidates/${id}`);
};

/* ===================== */
/* JOBS (RECRUITER)      */
/* ===================== */

export const getCandidateUsers = () => {
  return api.get("/admin/users/candidates");
};

export const getRecruiterJobs = () => {
  return api.get("/jobs/getAllJobsList");
};

export const deactivateRecruiterJob = (jobId) => {
  return api.put(`/jobs/${jobId}/deactivate`);
};

export const activateRecruiterJob = (jobId) => {
  return api.put(`/jobs/${jobId}/activate`);
};

export const getJobCandidates = (jobId) => {
  return api.get(`/jobs/${jobId}/candidates`);
};

export const getAllJobsCandidates = () => {
  return api.get(`/jobs/candidates/all`);
};

export const updateRecruiterJob = (jobId, data) => {
  return api.put(`/jobs/${jobId}`, data);
};

export const deleteRecruiterJob = (jobId) => {
  return api.delete(`/jobs/${jobId}`);
};

export const createRecruiterJob = (formData) => {
  return api.post("/admin/jobs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};