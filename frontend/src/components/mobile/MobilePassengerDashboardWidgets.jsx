import React from 'react';
import { Star, Bus, CreditCard, Coffee, ChevronRight } from 'lucide-react';

const MobilePassengerDashboardWidgets = ({ dashboardData, loading }) => {
  return (
    <>
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <Star className="text-[#10b981] mb-3" size={18} />
          <p className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">{loading ? '...' : dashboardData?.loyaltyPoints || 0}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mt-1">Loyalty Points</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <Bus className="text-[#10b981] mb-3" size={18} />
          <p className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">{loading ? '...' : dashboardData?.totalTrips || 0}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mt-1">Total Trips</p>
        </div>
      </div>

      {/* Travel Credits */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between mb-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={14} className="text-[#10b981]" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Travel Credits</p>
          </div>
          <p className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">₹{loading ? '...' : dashboardData?.travelCredits || 0}</p>
        </div>
        <button className="px-5 py-2 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 rounded-xl text-xs font-bold hover:bg-[#10b981] hover:text-white transition-all active:scale-95">
          Redeem
        </button>
      </div>

      {/* Lounge Access Card */}
      <button className="w-full bg-white dark:bg-slate-900 border border-[#10b981]/30 rounded-2xl p-4 flex items-center justify-between group hover:border-[#10b981] transition-all mb-8 shadow-sm">
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 bg-[#10b981]/10 text-[#10b981] rounded-xl flex items-center justify-center shrink-0">
            <Coffee size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Exclusive Lounge Access</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Complimentary refreshments on your trip.</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-400 group-hover:text-[#10b981] transition-colors" />
      </button>
    </>
  );
};

export default MobilePassengerDashboardWidgets;
