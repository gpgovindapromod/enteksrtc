import React from 'react';

const SupportDashboard = ({ data, loading }) => {
  if (loading) return <div className="text-center p-8">Loading...</div>;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Support Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="text-sm text-slate-500 mb-1">Open Tickets</div>
          <div className="text-3xl font-bold text-amber-500">{data?.openTickets || 0}</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
          <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Resolved Today</div>
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{data?.resolvedToday || 0}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800/30">
          <div className="text-sm text-red-600 dark:text-red-400 mb-1">Urgent Complaints</div>
          <div className="text-3xl font-bold text-red-700 dark:text-red-300">{data?.urgentComplaints || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
