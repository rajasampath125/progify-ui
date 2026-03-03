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

export const updateCategory = (id, name) =>
  api.put(`/admin/categories/${id}`, { name });

export const deleteCategory = (id) =>
  api.delete(`/admin/categories/${id}`);

/* ===================== */
/* JOBS (ADMIN)          */
/* ===================== */

export const getAdminJobs = () =>
  api.get("/jobs/getAllJobsList");

export const getAdminJobsPaginated = (params) =>
  api.get("/jobs/paginated", { params });

export const activateJob = (jobId) =>
  api.put(`/jobs/${jobId}/activate`);

export const deactivateJob = (jobId) =>
  api.put(`/jobs/${jobId}/deactivate`);

export const deleteJob = (jobId) =>
  api.delete(`/jobs/${jobId}`);

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

export const getActiveUsers = () =>
  api.get("/admin/users/active");

export const activateUser = (id) =>
  api.put(`/admin/users/${id}/activate`);

export const deactivateUser = (id) =>
  api.put(`/admin/users/${id}/deactivate`);

export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const kickoutUser = (id) => api.delete(`/admin/users/${id}/kickout`);
export const createUser = (data) =>
  api.post("/admin/users/createusers", data);

/* ===================== */
/* USERS (ADMIN) UPDATE  */
/* ===================== */

export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

export const changeUserEmail = (id, newEmail) =>
  api.patch(`/admin/users/${id}/email`, { newEmail });

export const changeUserPassword = (id, newPassword) =>
  api.patch(`/admin/users/${id}/password`, { newPassword });

export const resetUserPassword = (id) =>
  api.post(`/admin/users/${id}/reset-password`, {});


/* ===================== */
/* ANALYTICS             */
/* ===================== */

export const getAdminJobAssignmentAnalytics = (from, to, candidateId, recruiterId) =>
  api.get("/admin/analytics/job-assignments", {
    params: { from, to, candidateId, recruiterId },
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

/* ===================== */
/* EXPENSES              */
/* ===================== */

export const getAllExpenses = () =>
  api.get("/admin/expenses");

export const createExpense = (data) =>
  api.post("/admin/expenses", data);

export const updateExpense = (id, data) =>
  api.put(`/admin/expenses/${id}`, data);

export const deleteExpense = (id) =>
  api.delete(`/admin/expenses/${id}`);