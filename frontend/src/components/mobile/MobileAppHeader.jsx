import React from 'react';
import { Sun, Moon, Bell, Ticket, Bus } from 'lucide-react';

const MobileAppHeader = ({
  theme,
  toggleTheme,
  showNotifications,
  setShowNotifications,
  isUserLoggedIn,
  setShowLoginModal
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 px-4 py-3 flex justify-between items-center transition-colors shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
          <Bus size={24} />
        </div>
        <div className="flex flex-col">
          <span className="font-headline-md text-lg text-emerald-500 font-bold font-outfit leading-tight tracking-tight">Ente KSRTC</span>
          <span className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Premium Journey</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Render mini Login button only if logged out */}
        {!isUserLoggedIn && (
          <button
            className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-sm font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-transform"
            onClick={() => setShowLoginModal(true)}
          >
            Login
          </button>
        )}

        <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" aria-label="Toggle Theme" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
      </div>

      {showNotifications && (
        <div className="absolute top-16 right-4 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-950">
            <h4 className="font-bold text-gray-900 dark:text-white font-outfit text-base">Notifications</h4>
            <button className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors" onClick={() => setShowNotifications(false)}>Close</button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <div className="flex gap-4 p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Ticket size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-1"><strong className="text-gray-900 dark:text-white block mb-0.5">Ticket Confirmed!</strong> Trivandrum to Bangalore on 05 Aug is confirmed.</p>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">1 hour ago</span>
              </div>
            </div>
            <div className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Bus size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-1"><strong className="text-gray-900 dark:text-white block mb-0.5">Schedule Update:</strong> All K-Swift premium services are running on schedule today.</p>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileAppHeader;
