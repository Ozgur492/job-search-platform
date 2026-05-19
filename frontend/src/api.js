import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
});

// Request interceptor: attach Firebase token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('firebaseToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('firebaseToken');
    }
    return Promise.reject(err);
  }
);

// Jobs
export const searchJobs = (params) => api.get('/jobs', { params });
export const getJob = (id) => api.get(`/jobs/${id}`);
export const getRelatedJobs = (id, limit = 3) => api.get(`/jobs/${id}/related`, { params: { limit } });
export const getApplicationCount = (id) => api.get(`/jobs/${id}/applications/count`);
export const applyToJob = (id) => api.post(`/jobs/${id}/applications`);

// Companies
export const getCompany = (id) => api.get(`/companies/${id}`);

// Applications
export const getMyApplications = (params) => api.get('/users/me/applications', { params });

// Job Alerts
export const createJobAlert = (data) => api.post('/job-alerts', data);
export const getMyAlerts = () => api.get('/job-alerts');
export const deleteAlert = (id) => api.delete(`/job-alerts/${id}`);

// Notifications
export const getMyNotifications = () => api.get('/notifications/me');
export const markNotificationRead = (id) => api.post(`/notifications/me/${id}/read`);

// Admin - Job management
export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.patch(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const listJobs = (params) => api.get('/jobs', { params });

// Companies
export const createCompany = (data) => api.post('/companies', data);
export const updateCompany = (id, data) => api.patch(`/companies/${id}`, data);

// AI Agent
export const chatWithAgent = (message, history) =>
  api.post('/agent/chat', { message, history });

export default api;
