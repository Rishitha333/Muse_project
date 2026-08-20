import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthToken = () => localStorage.getItem("token");

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── AUTH ────────────────────────────────────────────────

export const login = async (email, password) => {
  const response = await API.post("/api/auth/login", { email, password });
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

export const register = async (email, username, password) => {
  const response = await API.post("/api/auth/register", { email, username, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await API.get("/api/auth/me", { headers: getAuthHeaders() });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await API.get("/api/auth/users", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const isAuthenticated = () => !!getAuthToken();

// ─── HISTORY ─────────────────────────────────────────────

export const getHistory = async (page = 1, limit = 20) => {
  const response = await API.get("/api/history/list", {
    params: { page, limit },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getHistoryItem = async (analysisId) => {
  const response = await API.get(`/api/history/${analysisId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteHistory = async (analysisId) => {
  const response = await API.delete(`/api/history/${analysisId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getHistoryStats = async () => {
  const response = await API.get("/api/history/stats", {
    headers: getAuthHeaders(),
  });
  return response.data.stats;
};

export const updateProfile = async (data) => {
  const response = await API.put("/api/auth/update-profile", data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ─── ANALYZE ─────────────────────────────────────────────

export const analyzeCallApi = async (formData) => {
  const response = await API.post("/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getAuthHeaders(),
    },
  });
  return response.data;
};
// ─── ADMIN ───────────────────────────────────────────────
export const getAdminStats = async () => {
  const response = await API.get("/api/admin/stats", {
    headers: getAuthHeaders(),
  });
  return response.data.stats;
};

export const getAdminUsers = async () => {
  const response = await API.get("/api/admin/users", {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await API.put(
    `/api/admin/users/${userId}/role`,
    { role },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateUserStatus = async (userId, isActive) => {
  const response = await API.put(
    `/api/admin/users/${userId}/status`,
    { is_active: isActive },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getAdminCalls = async (page = 1, limit = 20) => {
  const response = await API.get("/api/admin/calls", {
    params: { page, limit },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getAdminActivity = async (limit = 20) => {
  const response = await API.get("/api/admin/activity", {
    params: { limit },
    headers: getAuthHeaders(),
  });
  return response.data.activity;
};

export default API;