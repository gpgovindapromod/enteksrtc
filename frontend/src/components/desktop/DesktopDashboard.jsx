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
import ErrorBoundary from '../ErrorBoundary';
import NotificationCenter from '../notifications/NotificationCenter';

const AdminDashboardWidgets = React.lazy(() => import('./dashboards/AdminDashboardWidgets'));
const PassengerDashboardWidgets = React.lazy(() => import('./dashboards/PassengerDashboardWidgets'));
const StationMasterDashboard = React.lazy(() => import('./dashboards/StationMasterDashboard'));
const ConductorDashboard = React.lazy(() => import('./dashboards/ConductorDashboard'));
const FrontOfficeDashboard = React.lazy(() => import('./dashboards/FrontOfficeDashboard'));
const DriverDashboard = React.lazy(() => import('./dashboards/DriverDashboard'));
const SupportDashboard = React.lazy(() => import('./dashboards/SupportDashboard'));
const SettingsView = React.lazy(() => import('./dashboards/SettingsView'));
const CancellationRefundPage = React.lazy(() => import('../shared/CancellationRefundPage'));

const PassengerDashboardWithBoundary = (props) => (
  <ErrorBoundary>
    <PassengerDashboardWidgets {...props} />
  </ErrorBoundary>
);

const ROLE_COMPONENTS = {
  passenger: PassengerDashboardWithBoundary,
  admin: AdminDashboardWidgets,
  stationMaster: StationMasterDashboard,
  frontOffice: FrontOfficeDashboard,
  conductor: ConductorDashboard,
  driver: FrontOfficeDashboard,
  support: SupportDashboard,
};

const DesktopDashboard = ({ theme, toggleTheme, onLogout }) => {
  const user = useAuthStore(state => state.user);
  
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
    else if (activeRole === ROLES.STATION_MASTER) setActiveTab('Overview');
    else if (activeRole === ROLES.FRONT_OFFICE || activeRole === ROLES.DRIVER) setActiveTab('Dispatch');
    else if (activeRole === ROLES.CONDUCTOR) setActiveTab('My Route');
    else if (activeRole === ROLES.SUPPORT) setActiveTab('Tickets');
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
          { id: 'Overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'Trips', icon: Route, label: 'Trips' },
          { id: 'Staff', icon: Users, label: 'Staff' },
          { id: 'Fleet', icon: Bus, label: 'Fleet' }
        ];
      case ROLES.CONDUCTOR:
        return [
          { id: 'My Route', icon: Route, label: 'My Route' },
          { id: 'Manifest', icon: Users, label: 'Manifest' },
          { id: 'Scan Tickets', icon: Ticket, label: 'Scan Tickets' }
        ];
      case ROLES.FRONT_OFFICE:
      case ROLES.DRIVER:
        return [
          { id: 'Dispatch', icon: Route, label: 'Dispatch & Fleet' },
          { id: 'Counter Booking', icon: Ticket, label: 'Counter Booking' },
          { id: 'Routes', icon: MapPin, label: 'Depot Routes' },
          { id: 'Overview', icon: LayoutDashboard, label: 'Station Overview' }
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
          { id: 'Refunds', icon: CreditCard, label: 'Refunds' },
          { id: 'Loyalty', icon: Star, label: 'Loyalty' },
          { id: 'Support', icon: LifeBuoy, label: 'Support' },
          { id: 'Amenities', icon: Coffee, label: 'Amenities' }
        ];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-inter flex overflow-hidden">

      {/* Side Navigation */}
      <aside className="w-64 border-r border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0b132b]/95 backdrop-blur-2xl flex flex-col fixed h-full z-40 transition-colors">
        <div className="p-8 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Bus className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black font-outfit text-gray-900 dark:text-white leading-tight tracking-tight">Ente KSRTC</h1>
            <div className="ente-badge-pill py-0.5 px-2 text-[9px] mt-0.5">Elite Transit</div>
          </div>
        </div>

        <div className="px-6 py-2">
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-white/10 mb-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shrink-0 shadow-md">
              <div className="w-full h-full rounded-full bg-[#0b132b] dark:bg-slate-900 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
                {(user?.name || user?.fullName || user?.firstName || 'T').charAt(0).toUpperCase()}
              </div>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2 className="text-sm font-bold truncate text-gray-900 dark:text-white">Welcome, {user?.name || user?.fullName || user?.firstName || 'Traveler'}</h2>
              {activeRole === ROLES.PASSENGER && (
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider">Elite Member</p>
              )}
              {activeRole !== ROLES.PASSENGER && (
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider">{activeRole}</p>
              )}
            </div>
          </div>

          {activeRole === ROLES.PASSENGER && (
            <button className="w-full py-2.5 ente-btn-emerald text-xs font-bold mb-4">
              Upgrade Tier
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {getSidebarLinks().map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <item.icon size={19} className={isActive ? 'text-emerald-500 scale-105' : 'group-hover:scale-105 transition-transform'} />
                <span className="text-sm">{item.label}</span>
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
        <header className="h-20 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between px-12 bg-white/80 dark:bg-[#0b132b]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            {activeRole === ROLES.PASSENGER && (
              <>
                <button className="text-emerald-500 font-bold border-b-2 border-emerald-500 pb-1">Discover</button>
                <button className="hover:text-slate-900 dark:text-white transition-colors">Routes</button>
                <button className="hover:text-slate-900 dark:text-white transition-colors">Experience</button>
              </>
            )}
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 mr-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Portal:</span>
              <span className="ente-badge-pill">
                {(activeRole || 'passenger').charAt(0).toUpperCase() + (activeRole || 'passenger').slice(1)}
              </span>
            </div>
            <NotificationCenter />
            
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
            <React.Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              </div>
            }>
              {activeTab === 'Settings' ? (
                <SettingsView />
              ) : activeRole === ROLES.PASSENGER && activeTab === 'Refunds' ? (
                <CancellationRefundPage />
              ) : activeTab === 'Home' || activeTab === 'Overview' || activeTab === 'Tracking' || activeTab === 'My Route' || activeTab === 'Manifest' || activeTab === 'Scan Tickets' || activeTab === 'Tickets' || activeTab === 'Stations' || activeTab === 'Bookings' || activeTab === 'Loyalty' || activeTab === 'Support' || activeTab === 'Amenities' || activeTab === 'Fleet' || activeTab === 'Users' || activeTab === 'Revenue' || activeTab === 'Staff' || activeTab === 'Trips' || activeTab === 'Dispatch' || activeTab === 'Counter Booking' || activeTab === 'Routes' ? (
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
            </React.Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesktopDashboard;