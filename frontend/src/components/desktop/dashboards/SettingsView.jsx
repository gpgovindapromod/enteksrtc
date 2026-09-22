import React, { useState } from 'react';
import { User, Bell, Lock, Shield, Smartphone, Globe, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../context/ThemeContext';

const SettingsView = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [tfaEnabled, setTfaEnabled] = useState(false);

  return (
    <div className="animate-fade-in-up w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#10b981]/20 blur-3xl rounded-full pointer-events-none"></div>
        <h2 className="text-4xl font-bold font-outfit text-slate-900 dark:text-white mb-2 relative z-10">Platform Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm relative z-10">Manage your account preferences and security configurations.</p>
      </div>

      <div className="space-y-8 relative z-10">
        
        {/* Profile Card (Full Width) */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-8 md:p-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#10b981] to-emerald-300 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-36 h-36 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center text-[#10b981] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={56} className="drop-shadow-sm" />
                )}
              </div>
            </div>
            
            <div className="flex-1 space-y-6 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-1">
                    {user?.name || user?.fullName || user?.firstName || 'User Account'}
                  </h3>
                  <div className="inline-block px-4 py-1.5 bg-[#10b981]/10 text-[#10b981] text-xs font-bold uppercase tracking-widest rounded-lg">
                    {(user?.role || 'passenger').toUpperCase()}
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-[#10b981] to-emerald-500 hover:from-emerald-500 hover:to-[#10b981] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 shrink-0">
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <p className="text-slate-900 dark:text-white font-medium">{user?.email || 'admin@enteksrtc.com'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                  <p className="text-slate-900 dark:text-white font-medium">{user?.phone || '+91 98765 43210'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Grid: Preferences & Security */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Preferences Box */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-8 relative shadow-xl shadow-slate-200/50 dark:shadow-black/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Globe size={20} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">App Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                    <Globe size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-base">Dark Mode</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Switch theme globally.</p>
                  </div>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`w-14 h-7 rounded-full transition-all duration-300 relative shadow-inner shrink-0 ${theme === 'dark' ? 'bg-[#10b981]' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-8' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800/50 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                    <Bell size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-base">Push Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Alerts for your trips.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-14 h-7 rounded-full transition-all duration-300 relative shadow-inner shrink-0 ${pushEnabled ? 'bg-[#10b981]' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${pushEnabled ? 'left-8' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Security Box */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-8 relative shadow-xl shadow-slate-200/50 dark:shadow-black/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">Security & Billing</h3>
            </div>
            
            <div className="space-y-4">
              <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800/50 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                    <Shield size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-base">Two-Factor Auth</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Extra layer of security.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTfaEnabled(!tfaEnabled)}
                  className={`px-5 py-2 text-sm font-bold rounded-xl transition-all shrink-0 ${tfaEnabled ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  {tfaEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800/50 hover:border-purple-200 dark:hover:border-purple-900/50 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-base">Payment Methods</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Saved cards & UPI.</p>
                  </div>
                </div>
                <button className="px-5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:text-purple-600 dark:hover:text-purple-400 shrink-0">
                  Manage
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsView;
