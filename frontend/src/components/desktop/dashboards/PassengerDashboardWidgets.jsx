import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Calendar, ArrowRightLeft, Star, CreditCard, ChevronRight, Coffee, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../../store/useBookingStore';
import StopSearchAutocomplete from '../../shared/StopSearchAutocomplete';

import { getMyBookings, cancelBooking } from '../../../services/bookingService';

const PassengerDashboardWidgets = ({ data, loading, user, activeTab = 'Home' }) => {
  const navigate = useNavigate();
  const [activeBookings, setActiveBookings] = useState([]);
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  useEffect(() => {
    if (activeTab === 'Bookings' || activeTab === 'Home') {
      getMyBookings().then(res => setActiveBookings(res || [])).catch(console.error);
    }
  }, [activeTab]);
  
  const mappedActiveBookings = activeBookings.map(b => ({
    tripId: b.tripId,
    totalFare: (b.totalFare || b.farePaise) || 0,
    bookingStatus: b.bookingStatus || 'Confirmed',
    seats: b.seats ? b.seats.map(s => s.seatNo) : [],
    id: b.bookingNumber || b._id,
    _id: b._id,
    qrCode: b.bookingNumber || b._id,
    boardingStop: b.boardingStop?.stopName || 'Source',
    droppingStop: b.droppingStop?.stopName || 'Destination',
    date: b.tripId?.departureDate
  }));

  const upcomingTrip = mappedActiveBookings[0] || data?.upcomingTrips?.[0];
  const recentTrips = [...mappedActiveBookings, ...(data?.recentTrips || [])];
  
  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [searchParams, setSearchParams] = useState({
    from: 'Trivandrum',
    to: 'Ernakulam',
    date: defaultDateStr
  });

  const [searchError, setSearchError] = useState('');

  const handleSearch = () => {
    if (!searchParams.from || !searchParams.from.trim()) { setSearchError("Please enter a departure city."); return; }
    if (!searchParams.to || !searchParams.to.trim()) { setSearchError("Please enter a destination city."); return; }
    if (searchParams.from.trim().toLowerCase() === searchParams.to.trim().toLowerCase()) { setSearchError("Origin and destination cannot be the same."); return; }
    if (!searchParams.date) { setSearchError("Please select a journey date."); return; }

    const selectedDate = new Date(searchParams.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { setSearchError("Journey date cannot be in the past."); return; }

    setSearchError('');
    navigate(`/search?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}`);
  };

  const handleSwap = () => {
    setSearchParams(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  if (activeTab === 'Bookings') {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">My Bookings</h2>
          <button className="px-4 py-2 bg-[#10b981] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform" onClick={() => navigate('/')}>
            Book New Trip
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {recentTrips.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                <Ticket size={40} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white mb-2">No Bookings Found</h3>
              <p className="text-slate-500 dark:text-slate-400">You haven't made any bus bookings yet.</p>
            </div>
          ) : (
            recentTrips.map((trip, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-3xl group hover:border-[#10b981]/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex items-center gap-6 md:w-1/3">
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-[#10b981] rounded-2xl flex items-center justify-center shrink-0">
                    <Bus size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#10b981] transition-colors">
                      {trip.boardingStop} → {trip.droppingStop}
                    </h4>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {new Date(trip.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-wrap gap-4 md:justify-center border-y md:border-y-0 md:border-x border-slate-100 dark:border-slate-800 py-4 md:py-0 md:px-6">
                  <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex-1 min-w-[100px]">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Status</p>
                    <p className={`text-sm font-bold ${trip.bookingStatus === 'Confirmed' ? 'text-[#10b981]' : 'text-slate-700 dark:text-slate-300'}`}>{trip.bookingStatus}</p>
                  </div>
                  <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex-1 min-w-[100px]">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Total Fare</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">₹{trip.totalFare}</p>
                  </div>
                  <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex-1 min-w-[100px]">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Seats</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{trip.seats?.join(', ') || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="md:w-1/4 flex justify-end">
                  <button 
                    onClick={() => setExpandedTicketId(expandedTicketId === i ? null : i)}
                    className="w-full md:w-auto px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {expandedTicketId === i ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
                
                {expandedTicketId === i && (
                  <div className="w-full mt-4 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white border border-slate-200 p-1 rounded-lg">
                        {/* Mock QR Code */}
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${trip.qrCode || trip.id}`} alt="QR Code" className="w-full h-full" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Ticket ID: <span className="font-mono text-[#10b981]">{trip.id || 'N/A'}</span></p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Please present this QR code to the conductor while boarding.</p>
                      </div>
                    </div>
                    {trip.id && (
                      <button 
                        onClick={async () => {
                          if(window.confirm('Are you sure you want to cancel this ticket?')) {
                            try {
                              await cancelBooking(trip._id);
                              alert('Booking cancelled');
                              getMyBookings().then(setActiveBookings);
                            } catch (error) {
                              alert('Cancel failed');
                            }
                          }
                        }}
                        className="px-6 py-2 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

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
              <StopSearchAutocomplete 
                label="From"
                value={searchParams.from}
                onChange={(name) => setSearchParams({ ...searchParams, from: name })}
                placeholder="E.g. Trivandrum"
              />
            </div>
            <div className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 relative">
              <button 
                onClick={handleSwap}
                className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#10b981] rounded-full flex items-center justify-center text-slate-900 dark:text-white z-10 border-4 border-white dark:border-slate-900 hover:scale-110 transition-transform"
              >
                <ArrowRightLeft size={14} />
              </button>
              <MapPin size={18} className="text-[#10b981]" />
              <StopSearchAutocomplete 
                label="To"
                value={searchParams.to}
                onChange={(name) => setSearchParams({ ...searchParams, to: name })}
                placeholder="E.g. Ernakulam"
              />
            </div>
            <div className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <Calendar size={18} className="text-[#10b981]" />
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold opacity-40">Date</p>
                <input 
                  type="date" 
                  className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-700 dark:text-white" 
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col relative w-auto">
            <button 
              onClick={handleSearch}
              className="h-[60px] px-8 bg-[#10b981] text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              Search Luxury Buses
            </button>
            {searchError && (
              <div className="absolute top-full mt-2 left-0 text-red-500 text-xs font-bold w-full text-center whitespace-nowrap bg-white/90 px-2 py-1 rounded shadow-sm">
                {searchError}
              </div>
            )}
          </div>
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
                      {new Date(upcomingTrip.date || upcomingTrip.tripId?.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {upcomingTrip.boardingStop || 'Source'}
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
                      {new Date(upcomingTrip.date || upcomingTrip.tripId?.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {upcomingTrip.droppingStop || 'Destination'}
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
              {recentTrips.length > 0 ? recentTrips.map((trip, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl group hover:border-[#10b981]/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold group-hover:text-[#10b981] transition-colors">
                      {trip.boardingStop} → {trip.droppingStop}
                    </h4>
                    <span className="text-[10px] bg-emerald-500/10 text-[#10b981] px-2 py-0.5 rounded font-bold">{trip.bookingStatus}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {new Date(trip.date).toLocaleDateString()} • {trip.tripId?.busId?.busType || 'Bus'}
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
