import api from "./axios";

export const getCurrentCandidate = () =>
  api.get("/candidate/me");

export const getAvailableJobs = (page, size, title = "", date = "") =>
  api.get(`/candidate/jobs/availablejobs`, {
    params: {
      page,
      size,
      ...(title ? { title } : {}),
      ...(date  ? { date  } : {}),
    },
  });

export const applyToJob = (jobId) =>
  api.post(`/candidate/jobs/${jobId}/apply`);

export const getAllCandidateJobs = (page, size, title = "", status = "", date = "") =>
  api.get(`/candidate/jobs/alljobs`, {
    params: {
      page,
      size,
      ...(title  ? { title  } : {}),
      ...(status && status !== "ALL" ? { status } : {}),
      ...(date   ? { date   } : {}),
    },
  });

export const getCandidateSummary = () =>
  api.get("/candidate/metrics/summary");

export const downloadResume = async (jobId) => {
  return await api.get(
    `/candidate/jobs/${jobId}/resume`,
    { responseType: "blob" }
  );
};
