import React from 'react';

const StationMasterDashboard = ({ data, loading }) => {
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header section with Depot name */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {data?.depotName ? `${data.depotName} Operations` : 'Station Master Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time transit operations and depot management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Platforms</div>
            <span className="material-symbols-outlined text-gray-400">local_parking</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{data?.activePlatforms || 0}</div>
        </div>
        
        <div className="bg-emerald-50/70 dark:bg-emerald-900/20 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800/30 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Arriving Buses</div>
            <span className="material-symbols-outlined text-emerald-500">arrow_downward</span>
          </div>
          <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-300">{data?.arrivingBuses || 0}</div>
        </div>
        
        <div className="bg-blue-50/70 dark:bg-blue-900/20 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800/30 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Departing Buses</div>
            <span className="material-symbols-outlined text-blue-500">arrow_upward</span>
          </div>
          <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">{data?.departingBuses || 0}</div>
        </div>
      </div>

      {/* Alerts Section */}
      {data?.alerts?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">warning</span>
            Active Alerts
          </h3>
          <div className="grid gap-3">
            {data.alerts.map((alert, idx) => (
              <div key={idx} className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-500 mt-0.5" style={{fontSize: '20px'}}>notifications_active</span>
                <p className="text-amber-800 dark:text-amber-300 text-sm font-medium leading-relaxed">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Departures */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">flight_takeoff</span>
              Upcoming Departures
            </h3>
            <button className="text-sm font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Bus No</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800/50">
                {data?.upcomingDepartures?.length > 0 ? (
                  data.upcomingDepartures.map(dep => (
                    <tr key={dep.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                        {new Date(dep.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{dep.route}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{dep.bus}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dep.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          dep.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {dep.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No upcoming departures found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Arrivals */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">flight_land</span>
              Recent Arrivals
            </h3>
            <button className="text-sm font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Bus No</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800/50">
                {data?.recentArrivals?.length > 0 ? (
                  data.recentArrivals.map(arr => (
                    <tr key={arr.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                        {new Date(arr.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{arr.route}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{arr.bus}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          arr.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          arr.status === 'RUNNING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {arr.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No recent arrivals found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationMasterDashboard;
