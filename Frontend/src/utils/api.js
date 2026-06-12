import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 8000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tw_token');
      localStorage.removeItem('tw_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser  = (data)       => API.post('/auth/register', data);
export const loginUser     = (data)       => API.post('/auth/login', data);
export const getMe         = ()           => API.get('/auth/me');
export const updateProfile = (data)       => API.put('/auth/update', data);

// Tasks
export const getTasks      = (params)     => API.get('/tasks', { params });
export const getTaskById   = (id)         => API.get(`/tasks/${id}`);
export const createTask    = (data)       => API.post('/tasks', data);
export const updateTask    = (id, data)   => API.put(`/tasks/${id}`, data);
export const deleteTask    = (id)         => API.delete(`/tasks/${id}`);
export const getTaskStats  = ()           => API.get('/tasks/stats');

export default API;