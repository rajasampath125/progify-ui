import api from "./axios";

export const getSchedules = (params) => api.get("/schedule", { params });
export const createSchedule = (data) => api.post("/schedule", data);
export const updateSchedule = (id, data) => api.put(`/schedule/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/schedule/${id}`);
export const getCandidatesList = () => api.get("/admin/users/candidates");

// Custom Interview Types
export const getInterviewTypes = () => api.get("/interview-types");
export const createInterviewType = (data) => api.post("/interview-types", data);
export const deleteInterviewType = (id) => api.delete(`/interview-types/${id}`);
