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
import DriverDashboard from './dashboards/DriverDashboard';
import SupportDashboard from './dashboards/SupportDashboard';
import SettingsView from './dashboards/SettingsView';
import ErrorBoundary from '../ErrorBoundary';

const PassengerDashboardWithBoundary = (props) => (
  <ErrorBoundary>
    <PassengerDashboardWidgets {...props} />
  </ErrorBoundary>
);

const ROLE_COMPONENTS = {
  passenger: PassengerDashboardWithBoundary,
  admin: AdminDashboardWidgets,
  stationMaster: StationMasterDashboard,
  conductor: ConductorDashboard,
  driver: DriverDashboard,
  support: SupportDashboard,
};

const DesktopDashboard = ({ theme, toggleTheme, onLogout }) => {
  const { user } = useAuthStore();
  
  const activeRole = normalizeRole(user?.role);
  const [activeTab, setActiveTab] = useState('Home');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    bookingStatus: '',
    paymentStatus: '',
    search: ''
  });

  const { dashboardData, loading } = useDashboardData(filters);

  const ActiveDashboardComponent = ROLE_COMPONENTS[activeRole] || PassengerDashboardWithBoundary;

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
      case ROLES.DRIVER:
        return [
          { id: 'My Route', icon: Route, label: 'My Route' },
          { id: 'Schedule', icon: Clock, label: 'Schedule' },
          { id: 'Vehicle Alerts', icon: AlertTriangle, label: 'Alerts' }
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

  const [showNotifications, setShowNotifications] = useState(false);
  
  const mockNotifications = [
    { id: 1, title: 'Booking Confirmed', message: 'Your upcoming trip to Munnar has been successfully confirmed.', time: '10 mins ago', unread: true },
    { id: 2, title: 'Fleet Update', message: 'New premium sleeper buses have been added to the fleet.', time: '2 hours ago', unread: true },
    { id: 3, title: 'Special Offer', message: 'Get 15% off on your next weekend ride. Check offers page.', time: '1 day ago', unread: false }
  ];
  
  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-inter flex overflow-hidden">

      {/* Side Navigation */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl flex flex-col fixed h-full z-40">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1a7a40] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bus className="text-slate-900 dark:text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-outfit text-[#1a7a40] leading-tight">Ente KSRTC</h1>
            <p className="text-[10px] tracking-widest uppercase opacity-60">Elite Travel</p>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1a7a40] to-emerald-300 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full bg-[#1a7a40] flex items-center justify-center text-white font-bold text-xl">
                {(user?.name || user?.fullName || user?.firstName || 'T').charAt(0).toUpperCase()}
              </div>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2 className="text-sm font-bold truncate">Welcome, {user?.name || user?.fullName || user?.firstName || 'Traveler'}</h2>
              {activeRole === ROLES.PASSENGER && (
                <p className="text-[10px] text-[#1a7a40] font-bold uppercase tracking-tighter">Elite Gold Member</p>
              )}
              {activeRole !== ROLES.PASSENGER && (
                <p className="text-[10px] text-[#1a7a40] font-bold uppercase tracking-tighter">{activeRole}</p>
              )}
            </div>
          </div>

          {activeRole === ROLES.PASSENGER && (
            <button className="w-full py-3 bg-[#1a7a40] text-white text-xs font-bold rounded-xl mb-4 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/10">
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
                className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl transition-all group ${isActive ? 'bg-[#1a7a40]/10 text-[#1a7a40] border-r-4 border-[#1a7a40]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:bg-slate-800/50 hover:text-slate-900 dark:text-white'}`}
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
                <button className="text-[#1a7a40] font-bold border-b-2 border-[#1a7a40] pb-1">Discover</button>
                <button className="hover:text-slate-900 dark:text-white transition-colors">Routes</button>
                <button className="hover:text-slate-900 dark:text-white transition-colors">Experience</button>
              </>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 mr-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role:</span>
              <span className="bg-[#1a7a40]/10 text-[#1a7a40] text-sm font-bold border border-[#1a7a40]/30 rounded-lg px-3 py-1">
                {(activeRole || 'passenger').charAt(0).toUpperCase() + (activeRole || 'passenger').slice(1)}
              </span>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications" 
                className="p-2 hover:bg-slate-100/50 dark:bg-slate-800/50 rounded-full transition-colors relative"
              >
                <Bell size={20} className="text-slate-500 dark:text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#1a7a40] rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-up">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <span className="text-xs text-[#1a7a40] font-bold cursor-pointer hover:underline">Mark all as read</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {mockNotifications.map((notif) => (
                      <div key={notif.id} className={`p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer ${notif.unread ? 'bg-[#1a7a40]/5 dark:bg-[#1a7a40]/10' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-bold ${notif.unread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{notif.title}</h4>
                          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap ml-2">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors text-sm font-bold text-slate-600 dark:text-slate-400">
                    View All Notifications
                  </div>
                </div>
              )}
            </div>
            
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
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#1a7a40] flex items-center justify-center text-white font-bold">
              {(user?.name || user?.fullName || user?.firstName || 'T').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto space-y-12">

          {/* Dynamic Main Content Based on Active Tab */}
          <div className="flex-1 transition-all duration-300">
            {activeTab === 'Settings' ? (
              <SettingsView />
            ) : activeTab === 'Home' || activeTab === 'Overview' || activeTab === 'Tracking' || activeTab === 'My Route' || activeTab === 'Tickets' || activeTab === 'Stations' || activeTab === 'Bookings' || activeTab === 'Loyalty' || activeTab === 'Support' || activeTab === 'Amenities' || activeTab === 'Fleet' || activeTab === 'Users' || activeTab === 'Revenue' ? (
              <ActiveDashboardComponent data={dashboardData} loading={loading} user={user} activeTab={activeTab} setActiveTab={setActiveTab} filters={filters} setFilters={setFilters} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl mt-12 w-full animate-fade-in-up">
                <div className="w-16 h-16 bg-[#1a7a40]/10 rounded-full flex items-center justify-center text-[#1a7a40] mb-6">
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