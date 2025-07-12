import axios from 'axios';
import { API_CONFIG } from '../config.js';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_CONFIG.getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if the user has a token and is on a protected route
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;
      const protectedRoutes = ['/messages', '/profile', '/admin'];
      
      // Only logout if user has a token AND is on a protected route
      if (token && protectedRoutes.some(route => currentPath.startsWith(route))) {
        console.log('401 error on protected route, logging out user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // If no token or not on protected route, just let the error pass through
    }
    return Promise.reject(error);
  }
);

export default api; 