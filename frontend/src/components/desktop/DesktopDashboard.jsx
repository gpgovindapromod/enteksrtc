import React, { useState, useEffect } from 'react';
import {
  Bus, Search, MapPin, Calendar, ChevronRight, Clock, CreditCard,
  Star, LayoutDashboard, Ticket, LifeBuoy, LogOut,
  Coffee, Bell, Settings, ArrowRightLeft,
  Users, TrendingUp, AlertTriangle, Route, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDashboardData } from '../../hooks/useDashboardData';
import { ROLES, normalizeRole } from '../../utils/roleUtils';
import AdminDashboardWidgets from './dashboards/AdminDashboardWidgets';
import PassengerDashboardWidgets from './dashboards/PassengerDashboardWidgets';
import StationMasterDashboard from './dashboards/StationMasterDashboard';
import ConductorDashboard from './dashboards/ConductorDashboard';
import SupportDashboard from './dashboards/SupportDashboard';
import SettingsView from './dashboards/SettingsView';

const DesktopDashboard = ({ theme, toggleTheme, onLogout }) => {
  const { user } = useAuthStore();
  
  const activeRole = normalizeRole(user?.role);
  const [activeTab, setActiveTab] = useState('Home');
  const { dashboardData, loading } = useDashboardData();

  const ROLE_COMPONENTS = {
    passenger: PassengerDashboardWidgets,
    admin: AdminDashboardWidgets,
    stationMaster: StationMasterDashboard,
    conductor: ConductorDashboard,
    support: SupportDashboard,
  };

  const ActiveDashboardComponent = ROLE_COMPONENTS[activeRole] || PassengerDashboardWidgets;

  // Sync activeTab if role changes
  useEffect(() => {
    if (activeRole === ROLES.ADMIN) setActiveTab('Overview');
    else if (activeRole === ROLES.PASSENGER) setActiveTab('Home');
    else setActiveTab('');
  }, [activeRole]);

  const upcomingTrip = dashboardData?.upcomingTrips?.[0];

  const getSidebarLinks = () => {
    switch (activeRole) {
      case ROLES.ADMIN:
        return [
          { id: 'Overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'Fleet', icon: Bus, label: 'Fleet' },
          { id: 'Stations', icon: MapPin, label: 'Stations' },
          { id: 'Users', icon: Users, label: 'Users' },
          { id: 'Revenue', icon: TrendingUp, label: 'Revenue' },
          { id: 'Settings', icon: Settings, label: 'Settings' }
        ];
      case ROLES.STATION_MASTER:
        return [
          { id: 'Tracking', icon: LayoutDashboard, label: 'Tracking' },
          { id: 'Schedules', icon: Clock, label: 'Schedules' },
          { id: 'Platforms', icon: MapPin, label: 'Platforms' },
          { id: 'Alerts', icon: AlertTriangle, label: 'Alerts' }
        ];
      case ROLES.CONDUCTOR:
        return [
          { id: 'My Route', icon: Route, label: 'My Route' },
          { id: 'Manifest', icon: Users, label: 'Manifest' },
          { id: 'Scan Tickets', icon: Ticket, label: 'Scan Tickets' }
        ];
      case ROLES.SUPPORT:
        return [
          { id: 'Tickets', icon: LayoutDashboard, label: 'Tickets' },
          { id: 'Refunds', icon: CreditCard, label: 'Refunds' },
          { id: 'Feedback', icon: Star, label: 'Feedback' }
        ];
      default:
        return [
          { id: 'Home', icon: LayoutDashboard, label: 'Home' },
          { id: 'Bookings', icon: Ticket, label: 'Bookings' },
          { id: 'Loyalty', icon: Star, label: 'Loyalty' },
          { id: 'Support', icon: LifeBuoy, label: 'Support' },
          { id: 'Amenities', icon: Coffee, label: 'Amenities' }
        ];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-inter flex overflow-hidden">

      {/* Side Navigation */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl flex flex-col fixed h-full z-40">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bus className="text-slate-900 dark:text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-outfit text-[#10b981] leading-tight">Ente KSRTC</h1>
            <p className="text-[10px] tracking-widest uppercase opacity-60">Elite Travel</p>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#10b981] to-emerald-300 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full bg-[#10b981] flex items-center justify-center text-white font-bold text-xl">
                {(user?.name || user?.fullName || user?.firstName || 'T').charAt(0).toUpperCase()}
              </div>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2 className="text-sm font-bold truncate">Welcome, {user?.name || user?.fullName || user?.firstName || 'Traveler'}</h2>
              {activeRole === ROLES.PASSENGER && (
                <p className="text-[10px] text-[#10b981] font-bold uppercase tracking-tighter">Elite Gold Member</p>
              )}
              {activeRole !== ROLES.PASSENGER && (
                <p className="text-[10px] text-[#10b981] font-bold uppercase tracking-tighter">{activeRole}</p>
              )}
            </div>
          </div>

          {activeRole === ROLES.PASSENGER && (
            <button className="w-full py-3 bg-[#10b981] text-white text-xs font-bold rounded-xl mb-4 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/10">
              Upgrade Seat
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {getSidebarLinks().map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl transition-all group ${isActive ? 'bg-[#10b981]/10 text-[#10b981] border-r-4 border-[#10b981]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:bg-slate-800/50 hover:text-slate-900 dark:text-white'}`}
              >
                <item.icon size={20} className={isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <button 
             onClick={onLogout}
             className="w-full flex items-center gap-4 px-6 py-3 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative">

        {/* Top Bar */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            {activeRole === ROLES.PASSENGER && (
              <>
                <button className="text-[#10b981] font-bold border-b-2 border-[#10b981] pb-1">Discover</button>
                <button className="hover:text-slate-900 dark:text-white transition-colors">Routes</button>
                <button className="hover:text-slate-900 dark:text-white transition-colors">Experience</button>
              </>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 mr-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role:</span>
              <span className="bg-[#10b981]/10 text-[#10b981] text-sm font-bold border border-[#10b981]/30 rounded-lg px-3 py-1">
                {(activeRole || 'passenger').charAt(0).toUpperCase() + (activeRole || 'passenger').slice(1)}
              </span>
            </div>
            <button aria-label="Notifications" className="p-2 hover:bg-slate-100/50 dark:bg-slate-800/50 rounded-full transition-colors relative">
              <Bell size={20} className="text-slate-500 dark:text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#10b981] rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button 
              onClick={() => setActiveTab('Settings')}
              aria-label="Settings" 
              className="p-2 hover:bg-slate-100/50 dark:bg-slate-800/50 rounded-full transition-colors"
            >
              <Settings size={20} className="text-slate-500 dark:text-slate-400" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#10b981] flex items-center justify-center text-white font-bold">
              {(user?.name || user?.fullName || user?.firstName || 'T').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto space-y-12">

          {/* Dynamic Main Content Based on Active Tab */}
          <div className="flex-1 transition-all duration-300">
            {activeTab === 'Settings' ? (
              <SettingsView />
            ) : activeTab === 'Home' || activeTab === 'Overview' || activeTab === 'Tracking' || activeTab === 'My Route' || activeTab === 'Tickets' || activeTab === 'Stations' ? (
              <ActiveDashboardComponent data={dashboardData} loading={loading} user={user} activeTab={activeTab} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl mt-12 w-full animate-fade-in-up">
                <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center text-[#10b981] mb-6">
                  {(() => {
                    const Icon = getSidebarLinks().find(t => t.id === activeTab)?.icon || Route;
                    return <Icon size={32} />;
                  })()}
                </div>
                <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white mb-2">{activeTab}</h2>
                <p className="text-slate-500 dark:text-slate-400">This section is currently under development.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesktopDashboard;