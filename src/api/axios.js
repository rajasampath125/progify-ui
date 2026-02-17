import axios from "axios";

const apiHost = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const api = axios.create({
  // Uses Cloud Run host in production; falls back to Vite proxy in local dev.
  baseURL: apiHost ? `${apiHost}/api` : "/api",
});

api.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized: token missing or expired");
    }
    return Promise.reject(error);
  }
);

export default api;
