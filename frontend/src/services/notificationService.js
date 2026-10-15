import apiClient, { createServiceError } from './apiClient';

/**
 * Fetch paginated notifications for current authenticated user
 * @param {number} page
 * @param {number} limit
 * @param {boolean} unreadOnly
 */
export const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  try {
    const res = await apiClient.get('/api/notifications', {
      params: { page, limit, unreadOnly }
    });
    return res.data?.data || { notifications: [], pagination: {}, unreadCount: 0 };
  } catch (error) {
    return createServiceError(error, 'Failed to fetch notifications');
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  try {
    const res = await apiClient.get('/api/notifications/unread-count');
    return res.data?.data?.unreadCount || 0;
  } catch (error) {
    console.warn('[notificationService] Failed to get unread count:', error.message);
    return 0;
  }
};

/**
 * Mark a single notification as read
 * @param {string} notificationId
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await apiClient.patch(`/api/notifications/${notificationId}/read`);
    return res.data?.data;
  } catch (error) {
    return createServiceError(error, 'Failed to mark notification as read');
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const res = await apiClient.patch('/api/notifications/read-all');
    return res.data?.data;
  } catch (error) {
    return createServiceError(error, 'Failed to mark all notifications as read');
  }
};
