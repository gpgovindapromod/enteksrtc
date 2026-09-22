import React from 'react';

const StationMasterDashboard = ({ data, loading }) => {
  if (loading) return <div className="text-center p-8">Loading...</div>;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Station Master Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="text-sm text-slate-500 mb-1">Active Platforms</div>
          <div className="text-3xl font-bold">{data?.activePlatforms || 0}</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
          <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Arriving Buses</div>
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{data?.arrivingBuses || 0}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Departing Buses</div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{data?.departingBuses || 0}</div>
        </div>
      </div>
      {data?.alerts?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-300 text-sm">
          <strong>Alert: </strong> {data.alerts[0].message}
        </div>
      )}
    </div>
  );
};

export default StationMasterDashboard;
