import React from 'react';
import { Ticket, CheckCircle2, AlertCircle, RefreshCw, Bus, Clock, ShieldAlert } from 'lucide-react';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getEventIcon = (eventType) => {
  switch (eventType) {
    case 'BOOKING_CONFIRMED':
    case 'PAYMENT_SUCCESS':
      return <CheckCircle2 size={18} className="text-emerald-500" />;
    case 'BOOKING_CANCELLED':
    case 'PAYMENT_FAILED':
    case 'TRIP_CANCELLED':
      return <AlertCircle size={18} className="text-red-500" />;
    case 'REFUND_REQUESTED':
    case 'REFUND_PROCESSED':
      return <RefreshCw size={18} className="text-blue-500" />;
    case 'SEATS_RELEASED':
    case 'MANIFEST_UPDATED':
      return <Bus size={18} className="text-amber-500" />;
    case 'DEPARTURE_REMINDER':
    case 'TIMETABLE_CHANGED':
      return <Clock size={18} className="text-purple-500" />;
    default:
      return <Ticket size={18} className="text-emerald-600" />;
  }
};

export const NotificationItem = ({ notification, onMarkRead }) => {
  const isUnread = !notification.isRead;

  return (
    <div
      onClick={() => {
        if (isUnread && onMarkRead) onMarkRead(notification._id);
      }}
      className={`p-4 border-b border-slate-100 dark:border-slate-800/80 transition-colors cursor-pointer flex gap-3 items-start ${
        isUnread
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
        {getEventIcon(notification.eventType)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h4
            className={`text-xs font-bold truncate ${
              isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {notification.title || notification.subject || 'Update'}
          </h4>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
            {formatTimeAgo(notification.createdAt || notification.sentAt)}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
          {notification.message}
        </p>
      </div>

      {isUnread && (
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 self-center" />
      )}
    </div>
  );
};
