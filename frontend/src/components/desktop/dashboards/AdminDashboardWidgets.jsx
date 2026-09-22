import React from 'react';
import { Users, Bus, TrendingUp, Calendar, CreditCard, ChevronRight, MapPin, Building2, UserCircle } from 'lucide-react';

const AdminDashboardWidgets = ({ data, loading, activeTab }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading Dashboard Metrics...</p>
      </div>
    );
  }

  if (activeTab === 'Stations') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden animate-fade-in-up">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-outfit">Station & Depot Management</h3>
              <p className="text-xs text-slate-500">Monitor all stations and assigned station masters</p>
            </div>
          </div>
          <div className="text-right">
             <span className="text-sm font-bold text-slate-900 dark:text-white">{data?.totalStations || 0}</span>
             <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total Stations</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-bold">Depot Code</th>
                <th className="p-4 font-bold">Location</th>
                <th className="p-4 font-bold text-center">Platforms</th>
                <th className="p-4 font-bold">Station Master(s)</th>
                <th className="p-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data?.stationsData?.length > 0 ? (
                data.stationsData.map((station, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-500">{station.depotCode}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{station.depotName}</p>
                      <p className="text-xs text-slate-500">{station.city}, {station.district}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg font-bold text-xs">
                        {station.totalPlatforms}
                      </span>
                    </td>
                    <td className="p-4">
                      {station.stationMasters?.length > 0 ? (
                        station.stationMasters.map((sm, i) => (
                          <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                             <UserCircle size={14} className="text-slate-400" />
                             <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{sm.fullName}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Master Assigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {station.isActive ? (
                         <span className="text-[10px] font-bold text-[#10b981] bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">Active</span>
                      ) : (
                         <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20 uppercase tracking-wider">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No stations configured yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-[#10b981]">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-[#10b981] bg-emerald-500/10 px-2 py-1 rounded-full">+12% Today</span>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">₹{data?.totalRevenue?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Total Revenue</p>
        </div>

        {/* Total Users */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
              <Users size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">{data?.totalUsers?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Total Users</p>
        </div>

        {/* Active Fleet */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
              <Bus size={24} />
            </div>
            <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></span>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">{data?.activeBuses || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Active Fleet</p>
        </div>

        {/* Total Stations (New Widget for Admin) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <Building2 size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">{data?.totalStations || 0}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Total Stations</p>
        </div>

      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold font-outfit">Recent Bookings</h3>
          <button className="text-xs font-bold text-[#10b981] hover:underline flex items-center">View All <ChevronRight size={14} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-bold">Booking ID</th>
                <th className="p-4 font-bold">Passenger</th>
                <th className="p-4 font-bold">Route</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold text-right">Fare</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data?.recentBookings?.length > 0 ? (
                data.recentBookings.map((booking, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-medium text-slate-900 dark:text-white">{booking.bookingNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{booking.passengerId?.fullName || 'Guest'}</p>
                      <p className="text-xs text-slate-500">{booking.passengerId?.phone || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {booking.tripId?.routeId?.sourceStop?.stopName || 'Unknown'} → {booking.tripId?.routeId?.destinationStop?.stopName || 'Unknown'}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{booking.tripId?.busId?.busNumber || 'Fleet'}</p>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="p-4 font-bold text-[#10b981] text-right">
                      ₹{booking.totalFare}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No recent bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardWidgets;
