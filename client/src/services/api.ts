import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor for adding JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const bpdService = {
  getAll: async () => {
    const response = await api.get('/bpd');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/bpd/${id}`);
    return response.data;
  },
  getStatsSummary: async () => {
    const response = await api.get('/bpd/stats/summary');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/bpd', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/bpd/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/bpd/${id}`);
    return response.data;
  },
  bulkUpload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/bpd/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  exportCsv: async () => {
    const response = await api.get('/bpd/export/csv', {
      responseType: 'blob'
    });
    return response.data;
  },
  saveSnapshot: async () => {
    const response = await api.post('/bpd/snapshot');
    return response.data;
  },
  restoreSnapshot: async () => {
    const response = await api.post('/bpd/restore-snapshot');
    return response.data;
  },
};

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/users', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const candidateService = {
  getAll: async () => {
    const response = await api.get('/candidates');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },
  updateIndicator: async (bpdId: string, candidateId: string, data: any) => {
    const response = await api.put(`/candidates/indicators/${bpdId}/${candidateId}`, data);
    return response.data;
  },
};

export default api;
