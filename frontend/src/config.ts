// src/config.ts
import axios from 'axios';

//export const API_BASE_URL: string = 'https://tfg-jmn-25-26.onrender.com/api';
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const APP_NAME: string = 'NujamaMotors';
export const COMPANY_NAME: string = 'Nujama Motors';
export const DOMAIN: string = 'nujamamotors.com';
export const SUPER_ADMIN_EMAIL: string = `admin@${DOMAIN}`;

// --- CREDENCIALES DE SUPABASE ---
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
    }
    return Promise.reject(error);
  }
);