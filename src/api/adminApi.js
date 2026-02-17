import api from "./axios";

/* ===================== */
/* CATEGORY (ADMIN)      */
/* ===================== */

export const getAllCategories = () =>
  api.get("/admin/categories");

export const createCategory = (name) =>
  api.post("/admin/categories", { name });

export const activateCategory = (id) =>
  api.put(`/admin/categories/${id}/activate`);

export const deactivateCategory = (id) =>
  api.put(`/admin/categories/${id}/deactivate`);

/* ===================== */
/* JOBS (ADMIN)          */
/* ===================== */

export const getAdminJobs = () =>
  api.get("/jobs/getAllJobsList");

export const activateJob = (jobId) =>
  api.put(`/jobs/${jobId}/activate`);

export const deactivateJob = (jobId) =>
  api.put(`/jobs/${jobId}/deactivate`);

/* ===================== */
/* DASHBOARD METRICS     */
/* ===================== */

export const getAdminSummary = () =>
  api.get("/admin/metrics/summary");

/* ===================== */
/* USERS (ADMIN)         */
/* ===================== */

export const getAllUsers = () =>
  api.get("/admin/users");

export const activateUser = (id) =>
  api.put(`/admin/users/${id}/activate`);

export const deactivateUser = (id) =>
  api.put(`/admin/users/${id}/deactivate`);

export const createUser = (data) =>
  api.post("/admin/users/createusers", data);

/* ===================== */
/* USERS (ADMIN) UPDATE  */
/* ===================== */

export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);


/* ===================== */
/* ANALYTICS             */
/* ===================== */

export const getAdminJobAssignmentAnalytics = (from, to) =>
  api.get("/admin/analytics/job-assignments", {
    params: { from, to },
  });

  /* ===================== */
/* ADMIN (PROFILE)      */
/* ===================== */

export const getCurrentAdmin = () =>
  api.get("/admin/me");

export const updateAdminProfile = (data) =>
  api.put("/admin/me", data);

export const getJobDownloadAudit = (jobId) =>
  api.get(`/jobs/${jobId}/downloads`);