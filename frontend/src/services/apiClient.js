import axios from 'axios';

// -----------------------------------------------------------------------------
// CENTRAL API CONFIGURATION
// -----------------------------------------------------------------------------
// When the real backend APIs are ready, this is the ONLY file you need to update 
// to configure the base URL, authentication headers, or global error handling.
// -----------------------------------------------------------------------------

const isLocalhost = (hostname) => hostname === 'localhost' || hostname === '127.0.0.1';
const configuredApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim();
const browserHostname = typeof window !== 'undefined' ? window.location.hostname : '';
const browserOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';

// A localhost API URL only works when the browser and backend run on the same
// machine. For LAN access, use Vite's same-origin /api proxy instead.
const configuredUrl = configuredApiBaseUrl ? new URL(configuredApiBaseUrl, browserOrigin) : null;
const isMisleadingLocalhostUrl = configuredUrl
  && isLocalhost(configuredUrl.hostname)
  && !isLocalhost(browserHostname);

export const API_BASE_URL = isMisleadingLocalhostUrl
  ? ''
  : configuredApiBaseUrl || (isLocalhost(browserHostname) ? 'http://localhost:5011' : '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 8000, // 8s timeout to prevent infinite blocking on dead/slow endpoints
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
