import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationService';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Universal hook for notifications across passenger, station master, and conductor dashboards.
 * Implements bounded, low-overhead polling (every 30s) when the window is focused.
 */
export const useNotifications = () => {
  const { isUserLoggedIn, token } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const pollingTimerRef = useRef(null);

  const fetchUnread = useCallback(async () => {
    if (!isUserLoggedIn) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (e) {
      // Ignore polling errors
    }
  }, [isUserLoggedIn]);

  const fetchList = useCallback(async (page = 1, append = false) => {
    if (!isUserLoggedIn) return;
    setIsLoading(true);
    try {
      const data = await getNotifications(page, 20);
      if (data) {
        setNotifications((prev) => (append ? [...prev, ...(data.notifications || [])] : data.notifications || []));
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (e) {
      console.warn('[useNotifications] fetch error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [isUserLoggedIn]);

  // Initial load
  useEffect(() => {
    if (isUserLoggedIn && token) {
      fetchList(1, false);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isUserLoggedIn, token, fetchList]);

  // Bounded polling for unread count (every 30 seconds when tab is active)
  useEffect(() => {
    if (!isUserLoggedIn) return;

    const tick = () => {
      if (document.visibilityState === 'visible') {
        fetchUnread();
      }
    };

    pollingTimerRef.current = setInterval(tick, 30000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnread();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isUserLoggedIn, fetchUnread]);

  const markOneRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error('[useNotifications] markOneRead failed:', e);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('[useNotifications] markAllRead failed:', e);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    pagination,
    fetchNotifications: fetchList,
    fetchUnreadCount: fetchUnread,
    markOneRead,
    markAllRead
  };
};
