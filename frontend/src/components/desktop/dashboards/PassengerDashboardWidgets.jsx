import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bus, MapPin, Calendar, ArrowRightLeft, Star, CreditCard, ChevronRight, Coffee, Ticket, Loader2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { normalizeBooking } from '../../../utils/bookingAdapter';
import { useBookingStore } from '../../../store/useBookingStore';
import StopSearchAutocomplete from '../../shared/StopSearchAutocomplete';
import { downloadTicketPDF } from '../../../utils/pdfUtils.jsx';

import { getMyBookings, cancelBooking } from '../../../services/bookingService';

const PassengerDashboardWidgets = ({ data, loading, user, activeTab = 'Home', setActiveTab }) => {
  const navigate = useNavigate();
  const [activeBookings, setActiveBookings] = useState([]);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [qrPopup, setQrPopup] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef();

  const loadBookings = async (pageNum, append = false) => {
    setIsLoadingMore(true);
    try {
      const res = await getMyBookings(pageNum, 10);
      if (res?.bookings) {
        setActiveBookings(prev => append ? [...prev, ...res.bookings] : res.bookings);
        setHasMore(res.pagination?.page < res.pagination?.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Bookings' || activeTab === 'Home') {
      loadBookings(1, false);
    }
  }, [activeTab]);

  const lastBookingElementRef = useCallback(node => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadBookings(page + 1, true);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore, page]);

  const safeFormatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    const d = new Date(dateStr);
    return isNaN(d) ? '--:--' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const safeFormatDate = (dateStr) => {
    if (!dateStr) return 'Unknown Date';
    const d = new Date(dateStr);
    return isNaN(d) ? 'Unknown Date' : d.toLocaleDateString();
  };

  const mappedActiveBookings = activeBookings.map(normalizeBooking);

  const validUpcomingBookings = mappedActiveBookings.filter(b => b.bookingStatus !== 'CANCELLED');
  const upcomingTrip = validUpcomingBookings[0] || (data?.upcomingTrips?.[0] ? normalizeBooking(data.upcomingTrips[0]) : null);
  const recentTrips = [...mappedActiveBookings, ...(data?.recentTrips || []).map(normalizeBooking)];

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
      <>
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
              recentTrips.map((trip, i) => {
                const isLast = i === recentTrips.length - 1;
                return (
                  <div
                    key={i}
                    ref={isLast ? lastBookingElementRef : null}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-3xl group hover:border-[#10b981]/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all flex flex-col md:flex-row gap-6 md:items-center"
                  >
                    <div className="flex items-center gap-6 md:w-1/3">
                      <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-[#10b981] rounded-2xl flex items-center justify-center shrink-0">
                        <Bus size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#10b981] transition-colors">
                          {trip.boardingStopName} → {trip.droppingStopName}
                        </h4>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          {safeFormatDate(trip.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-row justify-center gap-2 border-y md:border-y-0 md:border-x border-slate-100 dark:border-slate-800 py-4 md:py-0 md:px-6">
                      <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 flex-1 max-w-[110px]">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Status</p>
                        <p className={`text-xs md:text-sm font-bold ${trip.bookingStatus === 'Confirmed' ? 'text-[#10b981]' : 'text-slate-700 dark:text-slate-300'}`}>{trip.bookingStatus}</p>
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 flex-1 max-w-[110px]">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Total Fare</p>
                        <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">₹{trip.totalFare}</p>
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 flex-1 max-w-[110px]">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Seats</p>
                        <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">{trip.seats?.join(', ') || 'N/A'}</p>
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
                  </div>
                );
              })
            )}
            {isLoadingMore && (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="w-8 h-8 text-[#10b981] animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details Modal */}
        {expandedTicketId !== null && recentTrips[expandedTicketId] && (() => {
          const trip = recentTrips[expandedTicketId];
          const isCancelled = trip.bookingStatus === 'CANCELLED';
          return (
            <div className="fixed inset-0 z-[99990] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setExpandedTicketId(null)}>
              {/* The Ticket Itself */}
              <div className={`relative max-w-4xl w-full flex flex-col md:flex-row transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${isCancelled ? 'opacity-80 grayscale' : ''}`} onClick={e => e.stopPropagation()}>

                {/* Left Main Section (Route & Passengers) */}
                <div className="bg-white dark:bg-slate-900 w-full md:w-2/3 p-0 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden relative">

                  {/* Header Strip */}
                  <div className="bg-red-700 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src="/assets/images/ksrtc_logo.png" alt="KSRTC" className="h-10 w-10 object-contain bg-white rounded-full p-1" />
                      <div>
                        <h2 className="font-bold text-sm leading-tight tracking-wide">KERALA STATE ROAD</h2>
                        <h2 className="font-bold text-sm leading-tight tracking-wide">TRANSPORT CORPORATION</h2>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-red-100 uppercase tracking-widest">E-Ticket</div>
                      <div className="font-bold text-lg">{trip.bookingNumber || trip.id?.substring(0, 8).toUpperCase()}</div>
                    </div>
                  </div>

                  {/* Sub Header */}
                  <div className="bg-[#2e7d32] text-white px-6 py-2 flex justify-between items-center text-xs font-semibold">
                    <span>{trip.busType || 'Fast Passenger'}</span>
                    <span>Trip Code: {trip.tripCode || 'N/A'}</span>
                  </div>

                  {/* Body Content */}
                  <div className="p-8">
                    {/* Route Timeline */}
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8 mb-8">
                      <div className="relative pl-6">
                        <div className="absolute w-4 h-4 bg-[#2e7d32] rounded-full -left-[9px] top-1 border-4 border-white dark:border-slate-900 shadow-sm"></div>
                        <h3 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Boarding</h3>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{trip.boardingStopName || trip.from}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{trip.time || '21:30'} • {safeFormatDate(trip.date)}</p>
                      </div>
                      <div className="relative pl-6">
                        <div className="absolute w-4 h-4 bg-red-500 rounded-full -left-[9px] top-1 border-4 border-white dark:border-slate-900 shadow-sm"></div>
                        <h3 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Dropping</h3>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{trip.droppingStopName || trip.to}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Est. {trip.dropTime || '05:30'} • {safeFormatDate(trip.date)}</p>
                      </div>
                    </div>

                    {/* Passengers */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-4">Passenger Details</h3>
                      <div className="space-y-3">
                        {(trip.passengers && trip.passengers.length > 0) ? trip.passengers.map((p, i) => (
                          <div key={i} className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-700/60 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{p.passengerName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{p.age} Yrs • {p.gender}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Seat</span>
                              <p className="font-bold text-[#2e7d32] text-lg">{p.seatNo}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{user?.name || 'Passenger'}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Adult</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Seats</span>
                              <p className="font-bold text-[#2e7d32] text-lg">{trip.seats?.join(', ')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Perforation Divider (Desktop only) */}
                <div className="hidden md:flex flex-col items-center justify-between w-4 bg-slate-50 dark:bg-slate-950 relative">
                  <div className="w-6 h-6 bg-black/80 dark:bg-slate-900/60 rounded-full absolute -top-3 left-1/2 -translate-x-1/2"></div>
                  <div className="w-[2px] h-full border-l-2 border-dashed border-slate-300 dark:border-slate-700"></div>
                  <div className="w-6 h-6 bg-black/80 dark:bg-slate-900/60 rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2"></div>
                </div>

                {/* Right Sidebar Section (QR & Fare) */}
                <div className="bg-slate-50 dark:bg-slate-950 w-full md:w-1/3 p-8 flex flex-col justify-between rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none">

                  {/* Close Button Mobile/Desktop absolute */}
                  <button onClick={() => setExpandedTicketId(null)} className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-slate-400 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>

                  <div>
                    <h3 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-6 text-center">Boarding Pass QR</h3>
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-48 h-48 mx-auto cursor-pointer hover:shadow-md transition-shadow" onClick={() => { if (!isCancelled) setQrPopup(trip.qrCode || trip.id); }}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${trip.qrCode || trip.bookingNumber || trip.id}`} alt="QR Code" className={`w-full h-full ${isCancelled ? 'opacity-30 grayscale' : ''}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-widest text-center">Click to Enlarge</p>
                  </div>

                  <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-300 dark:border-slate-700">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total Fare</p>
                        <p className="text-3xl font-black text-[#2e7d32] tracking-tight">₹{trip.totalFare}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${trip.bookingStatus === 'Confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-[#2e7d32] dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {trip.bookingStatus}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {trip.id && !isCancelled && (
                        <>
                          <button
                            onClick={() => typeof downloadTicketPDF === 'function' ? downloadTicketPDF(trip, user, 'KSRTC_Ticket_' + (trip.bookingNumber || trip.id) + '.pdf') : console.error('downloadTicketPDF not found')}
                            className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                          >
                            <Download size={18} />
                            Download PDF
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to cancel this ticket?')) {
                                try {
                                  await cancelBooking(trip._id);
                                  alert('Booking cancelled');
                                  await loadBookings(1, false);
                                  setExpandedTicketId(null);
                                } catch (error) {
                                  alert('Cancel failed');
                                }
                              }
                            }}
                            className="w-full py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl font-bold transition-colors text-sm"
                          >
                            Cancel Ticket
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })()}

        {/* QR Popup Modal */}
        {qrPopup && (
          <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setQrPopup(null)}>
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Scan Ticket</h3>
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-6">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrPopup}`} alt="QR Code Enlarged" className="w-64 h-64 mx-auto" />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-6 font-mono text-center">PNR: {qrPopup}</p>
              <button
                onClick={() => setQrPopup(null)}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (activeTab === 'Loyalty') {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-6">Loyalty & Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#10b981] to-emerald-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-500/30 flex flex-col justify-center">
            <Star size={32} className="mb-4 opacity-80" />
            <p className="text-4xl font-bold font-outfit mb-2">{loading ? '...' : data?.loyaltyPoints || 0}</p>
            <p className="text-emerald-100 font-bold tracking-wider uppercase text-xs">Total Points</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Current Tier: Gold</h3>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-4">
              <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">250 points to Platinum</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-center items-center text-center hover:border-[#10b981] hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer group shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-[#10b981] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CreditCard size={24} />
            </div>
            <p className="font-bold text-slate-900 dark:text-white">Redeem Points</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'Support') {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-6">Help & Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Us</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Subject" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#10b981] transition-colors" />
              <textarea placeholder="Describe your issue..." rows="4" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#10b981] transition-colors"></textarea>
              <button className="w-full py-4 bg-[#10b981] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">Submit Ticket</button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">FAQs</h3>
            {['How to cancel a ticket?', 'Where is my refund?', 'Baggage allowance policy'].map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-[#10b981] hover:shadow-md transition-all flex justify-between items-center shadow-sm">
                <p className="font-bold text-slate-700 dark:text-slate-300">{faq}</p>
                <ChevronRight size={20} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'Amenities') {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mb-6">Premium Amenities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl group hover:border-[#10b981] hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-[#10b981] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Coffee size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lounge Access</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Enjoy complimentary snacks and comfortable seating at major terminals before your journey.</p>
            <span className="text-[#10b981] font-bold uppercase tracking-wider text-xs">View Locations →</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl group hover:border-[#10b981] hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-[#10b981] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Star size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">On-board Wi-Fi</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Stay connected on the go with high-speed internet available on all premium buses.</p>
            <span className="text-[#10b981] font-bold uppercase tracking-wider text-xs">Learn More →</span>
          </div>
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
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{upcomingTrip.bookingStatus || 'Confirmed'}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 relative">
                <div className="flex-1 flex justify-between items-center relative">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {safeFormatTime(upcomingTrip.date || upcomingTrip.tripId?.departureDate)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {upcomingTrip.boardingStopName}
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
                      {safeFormatTime(upcomingTrip.date || upcomingTrip.tripId?.departureDate)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {upcomingTrip.droppingStopName}
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
              <button 
                onClick={() => setActiveTab && setActiveTab('Bookings')}
                className="text-[10px] text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:text-white transition-colors uppercase tracking-widest">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentTrips.length > 0 ? recentTrips.slice(0, 3).map((trip, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl group hover:border-[#10b981]/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold group-hover:text-[#10b981] transition-colors">
                      {trip.boardingStopName} → {trip.droppingStopName}
                    </h4>
                    <span className="text-[10px] bg-emerald-500/10 text-[#10b981] px-2 py-0.5 rounded font-bold">{trip.bookingStatus}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {safeFormatDate(trip.date)} • {trip.tripId?.busId?.busType || 'Bus'}
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
