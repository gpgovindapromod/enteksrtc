import React, { useState, useRef, useEffect } from 'react';
import { NotificationBell } from './NotificationBell';
import { NotificationPanel } from './NotificationPanel';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationCenter = ({ className = '', placement = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markOneRead,
    markAllRead
  } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const alignmentClass = placement === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <NotificationBell
        unreadCount={unreadCount}
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      />

      {isOpen && (
        <div className={`absolute ${alignmentClass} mt-2 animate-fade-in-up z-50`}>
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            isLoading={isLoading}
            onMarkRead={markOneRead}
            onMarkAllRead={markAllRead}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
