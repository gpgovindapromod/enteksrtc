import React from 'react';
import { Bus, MapPin, Calendar, ArrowRightLeft, Star, CreditCard, ChevronRight, Coffee } from 'lucide-react';

const PassengerDashboardWidgets = ({ data, loading, user }) => {
  const upcomingTrip = data?.upcomingTrips?.[0];

  return (
    <div className="space-y-12">
      <section className="relative h-[400px] rounded-3xl overflow-hidden group shadow-2xl mb-12">
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-2xl hidden md:flex">
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
              <p className="text-2xl font-bold font-outfit">{loading ? '...' : data?.loyaltyPoints || 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Loyalty Points</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:scale-[1.02] transition-transform">
              <Bus className="text-[#10b981] mb-4" size={20} />
              <p className="text-2xl font-bold font-outfit">{loading ? '...' : data?.totalTrips || 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Total Trips</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={14} className="text-[#10b981]" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Travel Credits</p>
              </div>
              <p className="text-2xl font-bold font-outfit">₹{loading ? '...' : data?.travelCredits || 0}</p>
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
              {data?.recentTrips?.length > 0 ? data.recentTrips.map((trip, i) => (
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
    </div>
  );
};

export default PassengerDashboardWidgets;
