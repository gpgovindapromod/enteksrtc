import apiClient, { createServiceError } from './apiClient';

export const getStationMasterDashboard = async () => {
  try {
    const response = await apiClient.get('/api/station-master/dashboard');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch dashboard data.');
  }
};

export const getDepotStaff = async () => {
  try {
    const response = await apiClient.get('/api/station-master/staff');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch depot staff.');
  }
};

export const addDepotStaff = async (staffData) => {
  try {
    const response = await apiClient.post('/api/station-master/staff', staffData);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to add staff member.');
  }
};

export const updateDepotStaff = async (id, staffData) => {
  try {
    const response = await apiClient.put(`/api/station-master/staff/${id}`, staffData);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to update staff member.');
  }
};

export const getDepotFleet = async () => {
  try {
    const response = await apiClient.get('/api/station-master/fleet');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch fleet.');
  }
};

export const updateDepotFleet = async (id, busData) => {
  try {
    const response = await apiClient.put(`/api/station-master/fleet/${id}`, busData);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to update fleet.');
  }
};

export const getDepotTrips = async () => {
  try {
    const response = await apiClient.get('/api/station-master/trips');
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch trips.');
  }
};

export const getDepotManifest = async (tripId) => {
  try {
    const response = await apiClient.get(`/api/station-master/trips/${tripId}/manifest`);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to fetch trip manifest.');
  }
};

export const updateDepotTrip = async (id, tripData) => {
  try {
    const response = await apiClient.put(`/api/station-master/trips/${id}`, tripData);
    return response.data;
  } catch (error) {
    createServiceError(error, 'Unable to update trip.');
  }
};
