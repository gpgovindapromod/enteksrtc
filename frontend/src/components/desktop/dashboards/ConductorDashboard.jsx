import React from 'react';

const ConductorDashboard = ({ data, loading }) => {
  if (loading) return <div className="text-center p-8">Loading...</div>;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Conductor Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="text-sm text-slate-500 mb-1">Assigned Bus</div>
          <div className="text-2xl font-bold">{data?.assignedBus || '-'}</div>
          <div className="text-sm text-slate-400 mt-2">{data?.route || '-'}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="text-sm text-slate-500 mb-1">Passenger Manifest</div>
          <div className="text-3xl font-bold">{data?.boardedPassengers || 0} / {data?.totalPassengers || 0}</div>
          <div className="text-sm text-slate-400 mt-2">Boarded</div>
        </div>
      </div>
    </div>
  );
};

export default ConductorDashboard;
