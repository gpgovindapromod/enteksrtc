import axios from 'axios';

// -----------------------------------------------------------------------------
// CENTRAL API CONFIGURATION
// -----------------------------------------------------------------------------
// When the real backend APIs are ready, this is the ONLY file you need to update 
// to configure the base URL, authentication headers, or global error handling.
// -----------------------------------------------------------------------------

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalhost ? 'http://localhost:5011' : '');

export const apiClient = axios.create({
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

// Global Request Interceptor (Automatically injects Auth Token)
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for standardizing API errors across all services
export const createServiceError = (error, fallbackMessage) => {
  const serviceError = new Error(error?.response?.data?.message || error?.message || fallbackMessage);
  serviceError.statusCode = error?.response?.status;
  throw serviceError;
};

export default apiClient;
