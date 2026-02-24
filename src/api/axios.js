import axios from "axios";

const apiHost = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const BASE_URL = apiHost ? `${apiHost}/api` : "/api";
const AUTH_REFRESH_URL = apiHost ? `${apiHost}/auth/refresh` : "/auth/refresh";
const AUTH_LOGOUT_URL = apiHost ? `${apiHost}/auth/logout` : "/auth/logout";

const api = axios.create({ baseURL: BASE_URL });

// ── Helpers ────────────────────────────────────────────────────────────────
const getAuth = () => { try { return JSON.parse(localStorage.getItem("auth")) || {}; } catch { return {}; } };
const setToken = (token) => { const a = getAuth(); localStorage.setItem("auth", JSON.stringify({ ...a, token })); };
const clearAuth = () => { localStorage.clear(); };

// ── Request: attach access token ───────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const { token } = getAuth();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: auto-refresh on 401 ──────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh once per failed request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // While a refresh is already in-flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = getAuth();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Use raw axios (not intercepted `api`) to avoid infinite loops
        const { data } = await axios.post(AUTH_REFRESH_URL, { refreshToken });

        // Save new tokens back into localStorage under the `auth` key
        const currentAuth = getAuth();
        localStorage.setItem(
          "auth",
          JSON.stringify({
            ...currentAuth,
            token: data.token,
            refreshToken: data.refreshToken,
          })
        );

        processQueue(null, data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed → log the user out
        clearAuth();
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Logout helper (call on explicit user logout) ───────────────────────────
export const logoutAndClear = async () => {
  try {
    const { refreshToken } = getAuth();
    if (refreshToken) {
      await axios.post(AUTH_LOGOUT_URL, { refreshToken });
    }
  } catch {
    // Swallow — proceed to clear regardless
  } finally {
    clearAuth();
    window.location.href = "/";
  }
};

// ── Detect if the backend is completely unreachable ────────────────────────
export const isNetworkError = (error) =>
  !error.response && (error.code === "ERR_NETWORK" || error.message === "Network Error");

export default api;
