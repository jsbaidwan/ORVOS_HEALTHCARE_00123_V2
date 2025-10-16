import axios from 'axios';

// API base URL - update this with your actual API endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const clinicAPI = {
  getAll: () => api.get('/clinics'),
  getById: (id) => api.get(`/clinics/${id}`),
  create: (data) => api.post('/clinics', data),
  update: (id, data) => api.put(`/clinics/${id}`, data),
  delete: (id) => api.delete(`/clinics/${id}`),
  archive: (id) => api.put(`/clinics/${id}/archive`),
};

export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  getPending: () => api.get('/patients?status=pending'),
  getCompleted: () => api.get('/patients?status=completed'),
};

export const reportAPI = {
  getClinicPatients: (clinicId) => api.get(`/reports/clinic-patients/${clinicId}`),
  getDoctorReview: () => api.get('/reports/doctor-review'),
};

export const settingsAPI = {
  getEmailTemplates: () => api.get('/settings/email-templates'),
  updateEmailTemplate: (id, data) => api.put(`/settings/email-templates/${id}`, data),
  getClinicSettings: (clinicId) => api.get(`/settings/clinic/${clinicId}`),
  updateClinicSettings: (clinicId, data) => api.put(`/settings/clinic/${clinicId}`, data),
};

export default api;

