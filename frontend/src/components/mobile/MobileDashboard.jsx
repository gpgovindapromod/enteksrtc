import React, { useState, useEffect } from 'react';
import { User, Sun, Moon, Compass, Shield, RotateCcw, ChevronRight, ChevronDown, Phone, Star, Bus, Coffee, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getDashboardData } from '../../services/dashboardService';

const MobileDashboard = ({
  theme,
  toggleTheme,
  language,
  setLanguage,
  hasActivatedWebApp,
  setHasActivatedWebApp,
  faqExpanded,
  setFaqExpanded,
  onLogout,
  t
}) => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboardData().then(res => {
      if (res?.success) {
        setDashboardData(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in-up bg-slate-50 dark:bg-slate-950 min-h-full pb-8">
      {/* Profile Header Card */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#10b981] to-emerald-300 p-0.5 shrink-0 z-10">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900" alt="Profile" />
          </div>
          <div className="flex-1 z-10">
            <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white leading-tight">{user?.name || user?.fullName || user?.firstName || 'Traveler'}</h3>
            <p className="text-[10px] text-[#10b981] font-bold uppercase tracking-widest mt-1">Elite Gold Member</p>
          </div>
          <button className="z-10 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-500 transition-colors" onClick={onLogout} aria-label="Sign Out">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>

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

        {/* Preferences Section */}
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-1">Preferences</h3>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Sun size={18} />
              <span className="text-sm font-medium">{t.theme || 'Dark Mode'}</span>
            </div>
            <button 
              className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-[#10b981]' : 'bg-slate-300 dark:bg-slate-700'}`}
              onClick={toggleTheme}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${theme === 'dark' ? 'translate-x-6.5 left-1' : 'translate-x-0.5 left-0.5'}`}></div>
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Compass size={18} />
              <span className="text-sm font-medium">{t.language || 'Language'}</span>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button 
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-white dark:bg-slate-900 shadow-sm text-[#10b981]' : 'text-slate-500'}`}
                onClick={() => setLanguage('en')}
              >EN</button>
              <button 
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${language === 'ml' ? 'bg-white dark:bg-slate-900 shadow-sm text-[#10b981]' : 'text-slate-500'}`}
                onClick={() => setLanguage('ml')}
              >മലയാളം</button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Shield size={18} />
              <span className="text-sm font-medium">Offline Sync Mode</span>
            </div>
            <button 
              className="w-12 h-6 rounded-full transition-colors relative bg-[#10b981]"
              onClick={() => alert('Offline sync is always active for elite passengers.')}
            >
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-1 translate-x-5.5 shadow-sm"></div>
            </button>
          </div>
        </div>

        {/* FAQ & Support Section */}
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-1">Support</h3>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-8">
          
          <div 
            className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            onClick={() => setHasActivatedWebApp(false)}
          >
            <div className="flex items-center gap-3 text-[#10b981]">
              <RotateCcw size={18} />
              <span className="text-sm font-bold">Return to Website Home</span>
            </div>
            <ChevronRight size={18} className="text-[#10b981]" />
          </div>

          {[
            { q: 'How can I refund my tickets?', a: 'Refunds are processed automatically when tickets are cancelled. Full refund applies if cancelled 24 hours prior to departure.' },
            { q: 'What is the baggage limit?', a: 'Up to 20kg of standard luggage is allowed per passenger free of charge. Excess luggage is subject to cargo fares.' },
            { q: 'Corporate Address', a: 'Kerala State Road Transport Corporation (KSRTC), Transport Bhavan, Fort, Trivandrum - Pin 695023' }
          ].map((faq, idx) => (
            <div key={idx} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
              <button 
                className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setFaqExpanded({...faqExpanded, [idx]: !faqExpanded[idx]})}
              >
                <span>{faq.q}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${faqExpanded[idx] ? 'rotate-180' : ''}`} />
              </button>
              {faqExpanded[idx] && (
                <div className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Helpline */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20 text-center">
          <h4 className="font-bold font-outfit text-lg mb-4 text-white">Need Urgent Support?</h4>
          <div className="flex gap-3">
            <a href="tel:0471-2463799" className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors">
              <Phone size={16} /> Enquiry
            </a>
            <a href="tel:18005994011" className="flex-1 bg-white hover:bg-gray-50 text-emerald-600 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-sm transition-colors">
              <Phone size={16} /> Toll-Free
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileDashboard;
