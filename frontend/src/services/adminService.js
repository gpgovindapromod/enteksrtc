import apiClient, { createServiceError } from './apiClient';

export const getAdminBookings = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/admin/bookings', { params });
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch admin bookings.');
  }
};

export const getAdminActivity = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/admin/activity', { params });
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch admin activity log.');
  }
};

export const getAdminFleet = async () => {
  try {
    const response = await apiClient.get('/api/admin/fleet');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch fleet data.');
  }
};

export const getAdminUsers = async () => {
  try {
    const response = await apiClient.get('/api/admin/users');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch users data.');
  }
};

export const addAdminFleet = async (busData) => {
  try {
    const response = await apiClient.post('/api/admin/fleet', busData);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to add new bus.');
  }
};

export const editAdminFleet = async (busId, busData) => {
  try {
    const response = await apiClient.put(`/api/admin/fleet/${busId}`, busData);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to edit bus.');
  }
};

export const deleteAdminFleet = async (busId) => {
  try {
    const response = await apiClient.delete(`/api/admin/fleet/${busId}`);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to delete bus.');
  }
};

export const addAdminUser = async (userData) => {
  try {
    const response = await apiClient.post('/api/admin/users', userData);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to invite user.');
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const response = await apiClient.patch(`/api/admin/users/${userId}/status`);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to change user status.');
  }
};

export const editAdminUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to edit user.');
  }
};

export const deleteAdminUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to delete user.');
  }
};

export const addAdminStation = async (stationData) => {
  try {
    const response = await apiClient.post('/api/admin/stations', stationData);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to add station.');
  }
};

export const editAdminStation = async (stationId, stationData) => {
  try {
    const response = await apiClient.put(`/api/admin/stations/${stationId}`, stationData);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to edit station.');
  }
};
export const getAdminRevenue = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/admin/revenue', { params });
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch admin revenue.');
  }
};

export const processAdminRefund = async (paymentId, amount = null) => {
  try {
    const response = await apiClient.post(`/api/admin/revenue/${paymentId}/refund`, { amount });
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to process refund.');
  }
};
export const deleteAdminStation = async (stationId) => {
  try {
    const response = await apiClient.delete(`/api/admin/stations/${stationId}`);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to delete station.');
  }
};

export const toggleStationStatus = async (stationId) => {
  try {
    const response = await apiClient.patch(`/api/admin/stations/${stationId}/status`);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to change station status.');
  }
};

export const getAdminAnalytics = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/admin/analytics', { params });
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch analytics.');
  }
};
