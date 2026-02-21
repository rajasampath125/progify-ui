import api from "./axios";

export const getCurrentCandidate = () =>
  api.get("/candidate/me");

export const getAvailableJobs = (page, size) =>
  api.get(`/candidate/jobs/availablejobs?page=${page}&size=${size}`);

export const applyToJob = (jobId) =>
  api.post(`/candidate/jobs/${jobId}/apply`);

export const getAllCandidateJobs = (page, size) =>
  api.get(`/candidate/jobs/alljobs?page=${page}&size=${size}`);

export const getCandidateSummary = () =>
  api.get("/candidate/metrics/summary");

export const downloadResume = async (jobId) => {
  return await api.get(
    `/candidate/jobs/${jobId}/resume`,
    { responseType: "blob" }
  );
};
