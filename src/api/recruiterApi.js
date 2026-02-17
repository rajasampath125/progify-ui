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

export const createRecruiterJob = (formData) => {
  return api.post("/admin/jobs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


// import axios from "axios";

// const getAuthHeader = () => {
//   const auth = JSON.parse(localStorage.getItem("auth"));
//   return {
//     Authorization: `Bearer ${auth?.token}`,
//   };
// };


// /* ===================== */
// /* RECRUITER (PROFILE)      */
// /* ===================== */

// export const getCurrentRecruiter = () => {
//   const auth = JSON.parse(localStorage.getItem("auth"));
//   const token = auth?.token;

//   return axios.get("/api/recruiter/me", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };

// /* ================================ */
// /* RECRUITER (CANDIDATES LIST)      */
// /* ================================ */

// export const getAllCandidatesForRecruiter = () => {
//   const auth = JSON.parse(localStorage.getItem("auth"));
//   const token = auth?.token;

//   return axios.get("/api/admin/users/candidates", {
//     headers: getAuthHeader(),
//   });
// };

// export const getCandidateById = (id) => {
//   const auth = JSON.parse(localStorage.getItem("auth"));
//   return axios.get(`/api/recruiter/candidates/${id}`, {
//     headers: {
//       Authorization: `Bearer ${auth.token}`,
//     },
//   });
// };


// /* ===================== */
// /* JOBS (RECRUITER)      */
// /* ===================== */

// export const getCandidateUsers = () => {
//   return axios.get("/api/admin/users/candidates", {
//     headers: getAuthHeader(),
//   });
// };

// export const getRecruiterJobs = () => {
//   return axios.get("/api/jobs/getAllJobsList", {
//     headers: getAuthHeader(),
//   });
// };

// export const deactivateRecruiterJob = (jobId) => {
//   return axios.put(
//     `/api/jobs/${jobId}/deactivate`,
//     {},
//     {
//       headers: getAuthHeader(),
//     }
//   );
// };

// export const getJobCandidates = (jobId) => {
//   return axios.get(`/api/jobs/${jobId}/candidates`, {
//     headers: getAuthHeader(),
//   });
// };

// export const createRecruiterJob = (formData) => {
//   return axios.post("/api/admin/jobs", formData, {
//     headers: {
//       ...getAuthHeader(),
//       "Content-Type": "multipart/form-data",
//     },
//   });
// };

// export const activateRecruiterJob = (jobId) => {
//   return axios.put(
//     `/api/jobs/${jobId}/activate`,
//     {},
//     {
//       headers: getAuthHeader(),
//     }
//   );
// };
