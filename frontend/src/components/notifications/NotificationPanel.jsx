import React from 'react';
import { NotificationItem } from './NotificationItem';
import { CheckCheck, BellOff, Loader2 } from 'lucide-react';

export const NotificationPanel = ({
  notifications = [],
  unreadCount = 0,
  isLoading = false,
  onMarkRead,
  onMarkAllRead,
  onClose,
  className = ''
}) => {
  return (
    <div
      className={`w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 flex flex-col ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && onMarkAllRead && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 transition-colors"
            >
              <CheckCheck size={14} />
              Mark read
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* List Content */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
        {isLoading && notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-emerald-500" />
            <span className="text-xs">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <BellOff size={28} className="text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif._id}
              notification={notif}
              onMarkRead={onMarkRead}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 font-medium">
          Showing recent {notifications.length} notifications
        </div>
      )}
    </div>
  );
};
