import apiClient, { createServiceError } from './apiClient';

export const getDashboardData = async (filters = {}) => {
  try {
    const response = await apiClient.get('/api/dashboard', { params: filters });
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch dashboard data.');
  }
};
