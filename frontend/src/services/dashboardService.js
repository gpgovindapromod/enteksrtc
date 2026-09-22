import apiClient, { createServiceError } from './apiClient';

export const getDashboardData = async () => {
  try {
    const response = await apiClient.get('/api/dashboard');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch dashboard data.');
  }
};
