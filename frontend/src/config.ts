// src/config.ts
import axios from 'axios';

export const API_BASE_URL: string = 'https://tfg-frontend-h7hs.onrender.com/api';
//export const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const APP_NAME: string = 'LosAutosDeJavibu';

// Configurar axios
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Accept'] = 'application/json';

// Interceptor para incluir token automáticamente
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de auth
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Opcional: redirigir a login
    }
    return Promise.reject(error);
  }
);