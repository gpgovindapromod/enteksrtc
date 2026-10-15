import React from 'react';
import { useNotifications } from '../../../hooks/useNotifications';
import { NotificationItem } from '../../notifications/NotificationItem';
import { Bus, Users, Bell } from 'lucide-react';

const ConductorDashboard = ({ data, loading }) => {
  const { notifications, unreadCount, markOneRead } = useNotifications();

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <div className="ente-badge-pill mb-2">
            <Bus size={12} />
            <span>Field Operations</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Conductor Console</h2>
        </div>
        {unreadCount > 0 && (
          <span className="ente-badge-pill border-emerald-500/40 animate-pulse">
            {unreadCount} new alerts
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="ente-card-glass p-6 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
              <Bus size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assigned Bus</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{data?.assignedBus || 'KL-15-A-1965'}</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-1">{data?.route || 'Thiruvananthapuram ➔ Ernakulam (Fast Passenger)'}</div>
        </div>

        <div className="ente-card-glass p-6 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
              <Users size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passenger Manifest</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {data?.boardedPassengers || 0} / {data?.totalPassengers || 0}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-1">Live Boarding status on current sector</div>
        </div>
      </div>

      {/* Manifest & Cancellation Alerts */}
      <div className="ente-card-glass p-7 overflow-hidden">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/10">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Trip Manifest & Cancellation Updates</h3>
            <p className="text-xs text-slate-400">Real-time alerts triggered on passenger seat cancellations and route reassignments</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">No active manifest updates.</div>
          ) : (
            notifications.map((notif) => (
              <NotificationItem key={notif._id} notification={notif} onMarkRead={markOneRead} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConductorDashboard;
