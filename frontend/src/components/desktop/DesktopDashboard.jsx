import React, { useState, useEffect } from 'react';
import {
  Bus, Search, MapPin, Calendar, ChevronRight, Clock, CreditCard,
  Star, LayoutDashboard, Ticket, LifeBuoy,
  Coffee, Bell, Settings, ArrowRightLeft,
  Users, TrendingUp, AlertTriangle, Route, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getDashboardData } from '../../services/dashboardService';


const ROLES = {
  PASSENGER: 'passenger',
  ADMIN: 'admin',
  STATION_MASTER: 'stationMaster',
  CONDUCTOR: 'conductor',
  SUPPORT: 'support'
};

const DesktopDashboard = ({ theme, toggleTheme }) => {
  const { user } = useAuthStore();
  const [activeRole, setActiveRole] = useState(user?.role || ROLES.PASSENGER);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeRole === ROLES.PASSENGER) {
      setLoading(true);
      getDashboardData().then(res => {
        if (res?.success) {
          setDashboardData(res.data);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [activeRole]);

  const upcomingTrip = dashboardData?.upcomingTrips?.[0];

  const getSidebarLinks = () => {
    switch (activeRole) {
      case ROLES.ADMIN:
        return [
          { icon: LayoutDashboard, label: 'Overview', active: true },
          { icon: Bus, label: 'Fleet' },
          { icon: Users, label: 'Users' },
          { icon: TrendingUp, label: 'Revenue' },
          { icon: Settings, label: 'Settings' }
        ];
      case ROLES.STATION_MASTER:
        return [
          { icon: LayoutDashboard, label: 'Tracking', active: true },
          { icon: Clock, label: 'Schedules' },
          { icon: MapPin, label: 'Platforms' },
          { icon: AlertTriangle, label: 'Alerts' }
        ];
      case ROLES.CONDUCTOR:
        return [
          { icon: Route, label: 'My Route', active: true },
          { icon: Users, label: 'Manifest' },
          { icon: Ticket, label: 'Scan Tickets' }
        ];
      case ROLES.SUPPORT:
        return [
          { icon: LayoutDashboard, label: 'Tickets', active: true },
          { icon: CreditCard, label: 'Refunds' },
          { icon: Star, label: 'Feedback' }
        ];
      default:
        return [
          { icon: LayoutDashboard, label: 'Home', active: true },
          { icon: Ticket, label: 'Bookings' },
          { icon: Star, label: 'Loyalty' },
          { icon: LifeBuoy, label: 'Support' },
          { icon: Coffee, label: 'Amenities' }
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
          <div className="flex items-center gap-4 p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#10b981] to-emerald-300 p-0.5">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" className="w-full h-full rounded-full object-cover" alt="Profile" />
            </div>
            <div>
              <h2 className="text-sm font-bold truncate">Welcome, {user?.name || user?.fullName || user?.firstName || 'Traveler'}</h2>
              <p className="text-[10px] text-[#10b981] font-bold uppercase tracking-tighter">Elite Gold Member</p>
            </div>
          </div>

          <button className="w-full py-3 bg-[#10b981] text-white text-xs font-bold rounded-xl mb-8 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/10">
            Upgrade Seat
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {getSidebarLinks().map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all group ${item.active ? 'bg-[#10b981]/10 text-[#10b981] border-r-4 border-[#10b981]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:bg-slate-800/50 hover:text-slate-900 dark:text-white'}`}
            >
              <item.icon size={20} className={item.active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative">

        {/* Top Bar */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <button className="text-[#10b981] font-bold border-b-2 border-[#10b981] pb-1">Discover</button>
            <button className="hover:text-slate-900 dark:text-white transition-colors">Routes</button>
            <button className="hover:text-slate-900 dark:text-white transition-colors">Experience</button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 mr-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role:</span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value)}
                className="bg-[#10b981]/10 text-[#10b981] text-sm font-bold border border-[#10b981]/30 rounded-lg px-3 py-1 outline-none appearance-none cursor-pointer hover:bg-[#10b981]/20 transition-colors"
              >
                <option value={ROLES.PASSENGER}>Passenger</option>
                <option value={ROLES.ADMIN}>Admin</option>
                <option value={ROLES.STATION_MASTER}>Station Master</option>
                <option value={ROLES.CONDUCTOR}>Conductor/Driver</option>
                <option value={ROLES.SUPPORT}>Support</option>
              </select>
            </div>
            <button aria-label="Notifications" className="p-2 hover:bg-slate-100/50 dark:bg-slate-800/50 rounded-full transition-colors relative">
              <Bell size={20} className="text-slate-500 dark:text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#10b981] rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button aria-label="Settings" className="p-2 hover:bg-slate-100/50 dark:bg-slate-800/50 rounded-full transition-colors">
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
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" alt="Profile" />
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto space-y-12">

          {/* Hero Section */}
          {activeRole === ROLES.PASSENGER ? (
            <>
              <section className="relative h-[400px] rounded-3xl overflow-hidden group shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1200"
                  alt="Kerala Tea Plantations"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-16">
                  <h2 className="text-5xl font-outfit font-bold mb-4 tracking-tight leading-tight text-white">
                    Welcome back, <br />
                    <span className="text-[#10b981]">{user?.name || user?.fullName || user?.firstName || 'Traveler'}</span>
                  </h2>
                  <p className="max-w-md text-white/80 text-lg leading-relaxed">
                    Your next luxury journey across the cinematic landscapes of Kerala awaits. Experience precision and comfort.
                  </p>
                </div>

                {/* Quick Search Overlay */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-2xl">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3">
                      <MapPin size={18} className="text-[#10b981]" />
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold opacity-40">From</p>
                        <input className="bg-transparent border-none outline-none w-full text-sm font-medium" defaultValue="Thiruvananthapuram" />
                      </div>
                    </div>
                    <div className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 relative">
                      <button className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center text-slate-900 dark:text-white z-10 border-4 border-white dark:border-slate-900 hover:scale-110 transition-transform">
                        <ArrowRightLeft size={14} />
                      </button>
                      <MapPin size={18} className="text-[#10b981]" />
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold opacity-40">To</p>
                        <input className="bg-transparent border-none outline-none w-full text-sm font-medium" defaultValue="Ernakulam" />
                      </div>
                    </div>
                    <div className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3">
                      <Calendar size={18} className="text-[#10b981]" />
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold opacity-40">Date</p>
                        <input type="text" className="bg-transparent border-none outline-none w-full text-sm font-medium" defaultValue="28 Jul, 2024" />
                      </div>
                    </div>
                  </div>
                  <button className="h-[60px] px-8 bg-[#10b981] text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                    Search Luxury Buses
                  </button>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Upcoming Journey & Lounge Access */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-bold font-outfit">Upcoming Journey</h3>
                    <button className="text-[#10b981] text-xs font-bold hover:underline">View Ticket</button>
                  </div>

                  {/* Ticket Card */}
                  {upcomingTrip ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-12">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center text-[#10b981]">
                            <Bus size={28} />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold font-outfit">{upcomingTrip.tripId?.busId?.busNumber || 'K-Swift Gaja'}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{upcomingTrip.tripId?.busId?.busType || 'Volvo 9600 Multi-Axle Sleeper'}</p>
                          </div>
                        </div>
                        <div className="text-center p-6 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Fare</p>
                          <p className="text-xl font-bold text-[#10b981]">₹{upcomingTrip.totalFare || 0}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Confirmed</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 relative">
                        <div className="flex-1 flex justify-between items-center relative">
                          <div className="text-center">
                            <p className="text-2xl font-bold">
                              {new Date(upcomingTrip.tripId?.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {upcomingTrip.tripId?.routeId?.sourceStop?.stopName || 'Source'}
                            </p>
                          </div>

                          <div className="flex-1 flex flex-col items-center px-4 relative">
                            <div className="w-full h-[2px] bg-slate-100 dark:bg-slate-800 relative">
                              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-[#10b981]"></div>
                              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-outline-variant"></div>
                              <div className="absolute top-1/2 left-0 h-full bg-[#10b981] transition-all duration-500" style={{ width: '0%' }}></div>
                            </div>
                            <p className="text-[10px] font-bold text-[#10b981] mt-3">Route</p>
                            <p className="text-[8px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">{upcomingTrip.tripId?.routeId?.routeNumber}</p>
                          </div>

                          <div className="text-center">
                            <p className="text-2xl font-bold opacity-40">
                              {new Date(upcomingTrip.tripId?.arrivalDate || upcomingTrip.tripId?.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {upcomingTrip.tripId?.routeId?.destinationStop?.stopName || 'Destination'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center">
                      <p className="text-slate-500 dark:text-slate-400">No upcoming journeys</p>
                    </div>
                  )}

                  {/* Lounge Access Card */}
                  <button className="w-full bg-white dark:bg-slate-900 border border-[#10b981]/30 rounded-2xl p-6 flex items-center justify-between group hover:border-[#10b981] transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-[#10b981]/10 text-[#10b981] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Coffee size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold">Exclusive KSRTC Lounge Access</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Complimentary refreshments before your next trip.</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-500 dark:text-slate-400 group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
                  </button>
                </div>

                {/* Sidebar Stats & History */}
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:scale-[1.02] transition-transform">
                      <Star className="text-[#10b981] mb-4" size={20} />
                      <p className="text-2xl font-bold font-outfit">{loading ? '...' : dashboardData?.loyaltyPoints || 0}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Loyalty Points</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:scale-[1.02] transition-transform">
                      <Bus className="text-[#10b981] mb-4" size={20} />
                      <p className="text-2xl font-bold font-outfit">{loading ? '...' : dashboardData?.totalTrips || 0}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Total Trips</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard size={14} className="text-[#10b981]" />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Travel Credits</p>
                      </div>
                      <p className="text-2xl font-bold font-outfit">₹{loading ? '...' : dashboardData?.travelCredits || 0}</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-[#10b981] hover:text-slate-900 dark:text-white transition-all">
                      Redeem
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold font-outfit">Recent Travels</h3>
                      <button className="text-[10px] text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:text-white transition-colors uppercase tracking-widest">View All</button>
                    </div>
                    <div className="space-y-4">
                      {dashboardData?.recentTrips?.length > 0 ? dashboardData.recentTrips.map((trip, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl group hover:border-[#10b981]/30 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-bold group-hover:text-[#10b981] transition-colors">
                              {trip.tripId?.routeId?.sourceStop?.stopName || 'Source'} → {trip.tripId?.routeId?.destinationStop?.stopName || 'Destination'}
                            </h4>
                            <span className="text-[10px] bg-emerald-500/10 text-[#10b981] px-2 py-0.5 rounded font-bold">{trip.bookingStatus}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {new Date(trip.tripId?.departureDate).toLocaleDateString()} • {trip.tripId?.busId?.busType || 'Bus'}
                          </p>
                        </div>
                      )) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No recent travels found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl mt-12 w-full">
              <Settings size={48} className="text-[#10b981] mb-6 animate-spin-slow opacity-50" />
              <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white mb-2">Role specific widgets coming soon!</h2>
              <p className="text-slate-500 dark:text-slate-400">You are currently viewing the {activeRole.toUpperCase()} layout.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DesktopDashboard;