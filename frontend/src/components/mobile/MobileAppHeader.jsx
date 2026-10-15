import React from 'react';
import { Sun, Moon, Bus } from 'lucide-react';
import NotificationCenter from '../notifications/NotificationCenter';

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

        {isUserLoggedIn && <NotificationCenter placement="right" />}
      </div>
    </header>
  );
};

export default MobileAppHeader;
