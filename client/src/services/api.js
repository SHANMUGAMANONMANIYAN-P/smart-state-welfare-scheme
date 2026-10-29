import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('welfare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('welfare_token');
        localStorage.removeItem('welfare_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  getGoogleStatus: () => apiClient.get('/auth/google/status'),
  verifyGoogleCredential: (credential) => apiClient.post('/auth/google/verify', { credential }),
};

export const profileAPI = {
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (profileData) => apiClient.put('/profile', profileData),
  getCompletion: () => apiClient.get('/profile/completion'),
};

export const schemesAPI = {
  getAll: (params) => apiClient.get('/schemes', { params }),
  getById: (id) => apiClient.get(`/schemes/${id}`),
};

export const eligibilityAPI = {
  evaluate: () => apiClient.post('/eligibility/evaluate'),
  getHistory: () => apiClient.get('/eligibility/history'),
  getHistoryDetail: (id) => apiClient.get(`/eligibility/history/${id}`),
};

export const savedSchemesAPI = {
  getAll: () => apiClient.get('/saved-schemes'),
  save: (schemeId, notes) => apiClient.post('/saved-schemes', { scheme_id: schemeId, notes }),
  remove: (schemeId) => apiClient.delete(`/saved-schemes/${schemeId}`),
};

export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};

export const adminAPI = {
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getReports: () => apiClient.get('/admin/reports'),
  getCitizens: () => apiClient.get('/admin/citizens'),
  getAllSchemes: (params) => apiClient.get('/admin/schemes', { params }),
  createScheme: (data) => apiClient.post('/admin/schemes', data),
  updateScheme: (id, data) => apiClient.put(`/admin/schemes/${id}`, data),
  toggleStatus: (id, isActive) => apiClient.patch(`/admin/schemes/${id}/status`, { is_active: isActive }),
  deleteScheme: (id) => apiClient.delete(`/admin/schemes/${id}`),
  addCriteria: (schemeId, data) => apiClient.post(`/admin/schemes/${schemeId}/criteria`, data),
  deleteCriteria: (criteriaId) => apiClient.delete(`/admin/criteria/${criteriaId}`),
  addDocument: (schemeId, data) => apiClient.post(`/admin/schemes/${schemeId}/documents`, data),
  deleteDocument: (docId) => apiClient.delete(`/admin/documents/${docId}`),
};

export const importAPI = {
  previewUpload: (formData) =>
    apiClient.post('/admin/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  loadPredefined: (datasetKey) =>
    apiClient.post('/admin/import/load-predefined', { datasetKey }),
  confirmImport: (payload) =>
    apiClient.post('/admin/import/confirm', payload),
  getLogs: () =>
    apiClient.get('/admin/import/logs'),
  verifyScheme: (schemeId, status) =>
    apiClient.patch(`/admin/import/schemes/${schemeId}/verify`, { status }),
  getTemplateDownloadUrl: (format) =>
    `${API_BASE_URL}/admin/import/template/${format}`,
};

export const chatbotAPI = {
  query: (question, language = 'en', userProfile = null) =>
    apiClient.post('/chatbot/query', { question, language, userProfile }),
  getSuggestions: (lang = 'en') =>
    apiClient.get('/chatbot/suggestions', { params: { lang } }),
};

export const api = apiClient;

export default apiClient;
