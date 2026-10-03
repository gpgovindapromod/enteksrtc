import React from 'react';
import { Bus, Route, MapPin, AlertTriangle, ChevronRight, Navigation } from 'lucide-react';

const DriverDashboard = ({ data, loading, activeTab }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading Schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <Bus size={24} />
            </div>
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">Assigned</span>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">KL-15-7788</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Current Bus</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-[#10b981]">
              <Route size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">TRV-EKM</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Next Route</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
              <AlertTriangle size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">0</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Active Alerts</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold font-outfit flex items-center gap-2"><Navigation size={20} className="text-[#10b981]"/> Upcoming Trips</h3>
        </div>
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
           No trips assigned for today yet. Check back later or contact the Station Master.
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
