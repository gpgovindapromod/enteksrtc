import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationBadge = ({ count, className = '' }) => {
  if (!count || count <= 0) return null;
  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export const NotificationBell = ({ unreadCount = 0, onClick, isOpen = false, className = '' }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Notifications"
      className={`p-2 rounded-full transition-colors relative hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 ${
        isOpen ? 'bg-slate-100 dark:bg-slate-800' : ''
      } ${className}`}
    >
      <Bell size={20} />
      <NotificationBadge count={unreadCount} />
    </button>
  );
};
