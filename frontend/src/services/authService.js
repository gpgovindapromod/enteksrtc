import apiClient, { createServiceError } from './apiClient';

export const registerUser = async (payload) => {
  try {
    const response = await apiClient.post('/api/auth/register', payload);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Registration failed.');
  }
};

export const sendOtp = async (phone) => {
  try {
    const response = await apiClient.post('/api/auth/send-otp', { phone });
    return response.data;
  } catch (error) {
    createServiceError(error, 'Failed to send OTP.');
  }
};

export const verifyOtp = async (phone, otp) => {
  try {
    const response = await apiClient.post('/api/auth/verify-otp', { phone, otp });
    return response.data;
  } catch (error) {
    createServiceError(error, 'OTP verification failed.');
  }
};

export const loginUser = async (payload) => {
  try {
    const response = await apiClient.post('/api/auth/login', payload);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Login failed.');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch user profile.');
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Logout failed.');
  }
};
