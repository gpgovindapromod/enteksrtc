import React from 'react';
import { CalendarDays } from 'lucide-react';

const TopRoutesSection = React.memo(({ routes, onBookRoute }) => (
  <section className="py-16 bg-transparent transition-colors">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">Routes</div>
      <h2 className="text-3xl font-black font-outfit text-slate-900 dark:text-white mb-8">Top Routes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {routes.map((route, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 group flex flex-col shadow-sm cursor-pointer">
            <div className="h-48 w-full overflow-hidden relative">
              <img src={route.img} alt={`${route.from} to ${route.to}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" width="400" height="250" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 text-white text-xs font-bold px-3 py-1 bg-emerald-500/90 rounded-lg shadow-md backdrop-blur-sm">
                {route.duration}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{route.from}</span>
                <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">→</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white text-right">{route.to}</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-slate-100 dark:border-white/5 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-bold">Starting from</span>
                  <span className="text-xl text-emerald-500 font-bold">{route.price}</span>
                </div>
                <button 
                  className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm text-sm font-bold active:scale-95 flex items-center gap-2"
                  onClick={(e) => { e.preventDefault(); onBookRoute && onBookRoute(route.from, route.to); }}
                >
                  <CalendarDays size={16} /> Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

export default TopRoutesSection;
