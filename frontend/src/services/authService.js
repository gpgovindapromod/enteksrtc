import axios from 'axios';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalhost ? 'http://localhost:5011' : '');

const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('enteksrtc_auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

authApi.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const createServiceError = (error, fallbackMessage) => {
  const serviceError = new Error(error?.response?.data?.message || error?.message || fallbackMessage);
  serviceError.statusCode = error?.response?.status;
  throw serviceError;
};

export const registerUser = async (payload) => {
  try {
    const response = await authApi.post('/api/auth/register', payload);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Registration failed.');
  }
};

export const loginUser = async (payload) => {
  try {
    const response = await authApi.post('/api/auth/login', payload);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Login failed.');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await authApi.get('/api/auth/me');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch user profile.');
  }
};

export const logoutUser = async () => {
  try {
    const response = await authApi.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Logout failed.');
  }
};

