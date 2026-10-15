import React, { useState, useEffect } from 'react';
import { 
  Bus, Users, Search, Play, CheckCircle, Ticket, 
  MapPin, Clock, FileText, X, Route as RouteIcon, 
  RefreshCw, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { 
  getDepotTrips, 
  getDepotStaff, 
  updateDepotTrip, 
  getDepotManifest, 
  getStationMasterDashboard 
} from '../../../services/stationMasterService';
import StopSearchAutocomplete from '../../shared/StopSearchAutocomplete';
import { useNavigate } from 'react-router-dom';

const FrontOfficeDashboard = ({ data, loading: parentLoading, user, activeTab = 'Dispatch', setActiveTab }) => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [staff, setStaff] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(data || null);
  const [loading, setLoading] = useState(true);
  const [selectedManifestTrip, setSelectedManifestTrip] = useState(null);
  const [manifestData, setManifestData] = useState(null);
  const [loadingManifest, setLoadingManifest] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  const [bookingForm, setBookingForm] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0]
  });

  const loadDepotData = async () => {
    setLoading(true);
    try {
      const [tripsRes, staffRes, statsRes] = await Promise.all([
        getDepotTrips(),
        getDepotStaff(),
        getStationMasterDashboard().catch(() => null)
      ]);
      if (tripsRes?.success) setTrips(tripsRes.data || []);
      if (staffRes?.success) setStaff(staffRes.data || []);
      if (statsRes?.success) setDashboardStats(statsRes.data);
    } catch (err) {
      console.error('[FrontOfficeDashboard] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepotData();
  }, []);

  const conductors = staff.filter(s => s.role === 'CONDUCTOR' && s.isActive);
  const depotName = dashboardStats?.depot?.name || dashboardStats?.depotName || user?.depotId?.depotName || 'Depot Counter';
  const depotCode = dashboardStats?.depot?.code || user?.depotId?.depotCode || 'DPT';

  // ── Mark Start of Journey (DEPARTED) ──────────────────────────────────────
  const handleStartJourney = async (tripId) => {
    if (!window.confirm('Mark this trip as DEPARTED to authorize the start of the journey?')) return;
    try {
      const res = await updateDepotTrip(tripId, { status: 'DEPARTED' });
      if (res?.success) {
        alert('Journey marked as started (DEPARTED).');
        loadDepotData();
      } else {
        alert(res?.message || 'Failed to start journey');
      }
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to start journey');
    }
  };

  // ── Assign Conductor ──────────────────────────────────────────────────────
  const handleAssignConductor = async (tripId, conductorId) => {
    if (!conductorId) return;
    try {
      const res = await updateDepotTrip(tripId, { conductorId });
      if (res?.success) {
        alert('Conductor assigned successfully');
        loadDepotData();
      } else {
        alert(res?.message || 'Failed to assign conductor');
      }
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to assign conductor');
    }
  };

  // ── View Passenger Manifest ───────────────────────────────────────────────
  const loadManifest = async (trip) => {
    setSelectedManifestTrip(trip);
    setManifestData(null);
    setLoadingManifest(true);
    try {
      const res = await getDepotManifest(trip._id);
      if (res?.success) {
        setManifestData(res.data || []);
      } else {
        setManifestData([]);
      }
    } catch (err) {
      console.error('Error fetching manifest:', err);
      setManifestData([]);
    } finally {
      setLoadingManifest(false);
    }
  };

  // ── Counter Booking Submit ────────────────────────────────────────────────
  const handleBookingSearch = (e) => {
    e.preventDefault();
    if (!bookingForm.from || !bookingForm.to) {
      alert('Please specify both origin and destination stops.');
      return;
    }
    navigate(`/search?from=${encodeURIComponent(bookingForm.from)}&to=${encodeURIComponent(bookingForm.to)}&date=${bookingForm.date}&counter=true`);
  };

  const filteredTrips = filterSearch
    ? trips.filter(t => 
        (t.routeId?.routeName || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
        (t.busId?.busNumber || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
        (t.busId?.registrationNumber || '').toLowerCase().includes(filterSearch.toLowerCase())
      )
    : trips;

  const uniqueRoutes = Array.from(new Set(trips.map(t => t.routeId?.routeName).filter(Boolean)));

  if (parentLoading || (loading && trips.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ── TOP HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="brand-badge">
            <Bus size={15} className="text-emerald-500" />
            <span>Station Front Office Counter</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {depotName} ({depotCode})
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Depot fleet dispatch, counter bookings, conductor assignments & journey authorization
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadDepotData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#162038] dark:hover:bg-[#1e2c4d] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-[#2a3756]"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <div className="brand-badge m-0">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Counter Online</span>
          </div>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Fleet */}
        <div className="bg-white dark:bg-[#0b132b] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-500">
              <Bus size={24} />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {trips.length} Scheduled
            </span>
          </div>
          <p className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
            {trips.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Depot Fleet Trips</p>
        </div>

        {/* Active Journeys */}
        <div className="bg-white dark:bg-[#0b132b] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-500">
              <RouteIcon size={24} />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
            {trips.filter(t => t.status === 'DEPARTED').length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Active Departed Buses</p>
        </div>

        {/* Pending Departures */}
        <div className="bg-white dark:bg-[#0b132b] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/15 rounded-2xl flex items-center justify-center text-amber-500">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
            {trips.filter(t => ['SCHEDULED', 'OPEN', 'BOARDING'].includes(t.status)).length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Pending Departure</p>
        </div>

        {/* Conductors */}
        <div className="bg-white dark:bg-[#0b132b] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/15 rounded-2xl flex items-center justify-center text-blue-500">
              <Users size={24} />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
            {conductors.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Depot Conductors</p>
        </div>
      </div>

      {/* ── COUNTER TICKET BOOKING CARD ── */}
      {(activeTab === 'Counter Booking' || activeTab === 'Dispatch') && (
        <div className="bg-white dark:bg-[#0b132b] rounded-3xl shadow-sm border border-slate-200 dark:border-white/10 p-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-outfit flex items-center gap-2 text-slate-900 dark:text-white">
              <Ticket className="text-emerald-500" /> Counter Ticket Booking
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Direct counter seat booking with physical receipt generation
            </span>
          </div>

          <form onSubmit={handleBookingSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="auth-label block mb-1.5">From Stop</label>
              <StopSearchAutocomplete
                value={bookingForm.from}
                onChange={(name) => setBookingForm(prev => ({ ...prev, from: name }))}
                placeholder="Origin Stop"
              />
            </div>
            <div>
              <label className="auth-label block mb-1.5">To Stop</label>
              <StopSearchAutocomplete
                value={bookingForm.to}
                onChange={(name) => setBookingForm(prev => ({ ...prev, to: name }))}
                placeholder="Destination Stop"
              />
            </div>
            <div>
              <label className="auth-label block mb-1.5">Date of Journey</label>
              <input
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                className="auth-input text-sm"
              />
            </div>
            <button
              type="submit"
              className="auth-btn-primary h-12 text-sm m-0 shadow-md shadow-emerald-500/20"
            >
              <Search size={16} /> Search & Book
            </button>
          </form>
        </div>
      )}

      {/* ── ROUTES DIRECTORY TAB ── */}
      {activeTab === 'Routes' && (
        <div className="bg-white dark:bg-[#0b132b] rounded-3xl shadow-sm border border-slate-200 dark:border-white/10 p-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-outfit flex items-center gap-2 text-slate-900 dark:text-white">
              <MapPin className="text-emerald-500" /> Depot Operating Routes ({uniqueRoutes.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueRoutes.map((routeName, idx) => {
              const routeTrips = trips.filter(t => t.routeId?.routeName === routeName);
              const sample = routeTrips[0]?.routeId;

              return (
                <div key={idx} className="bg-slate-50 dark:bg-[#111a30] border border-slate-200 dark:border-[#2a3756] p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {sample?.routeNumber || `RT-${idx + 1}`}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{routeTrips.length} Trips</span>
                    </div>
                    <h3 className="text-base font-bold font-outfit text-slate-900 dark:text-white mb-1">{routeName}</h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Depot: {depotCode}</span>
                    <button
                      onClick={() => {
                        setFilterSearch(routeName);
                        if (setActiveTab) setActiveTab('Dispatch');
                      }}
                      className="text-emerald-500 hover:text-emerald-600 font-bold"
                    >
                      View Buses &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
            {uniqueRoutes.length === 0 && (
              <div className="col-span-full p-8 text-center text-slate-400">
                No routes found for this depot.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FLEET DISPATCH & TRIP TABLE ── */}
      {(activeTab === 'Dispatch' || activeTab === 'Overview') && (
        <div className="bg-white dark:bg-[#0b132b] rounded-3xl shadow-sm border border-slate-200 dark:border-white/10 p-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold font-outfit flex items-center gap-2 text-slate-900 dark:text-white">
              <RouteIcon className="text-emerald-500" /> Depot Fleet & Dispatch Control
            </h2>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Filter bus or route..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a3756] bg-slate-50 dark:bg-[#162038] text-xs outline-none focus:border-emerald-500 w-full md:w-64 text-slate-900 dark:text-white"
              />
              {filterSearch && (
                <button onClick={() => setFilterSearch('')} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-[#111a30] text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-4 font-semibold">Route</th>
                  <th className="p-4 font-semibold">Departure</th>
                  <th className="p-4 font-semibold">Bus</th>
                  <th className="p-4 font-semibold">Conductor</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredTrips.map(t => {
                  const isDeparted = ['DEPARTED', 'COMPLETED'].includes(t.status);
                  const isCancelled = t.status === 'CANCELLED';

                  return (
                    <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <div>{t.routeId?.routeName || 'Scheduled Route'}</div>
                        <div className="text-xs text-slate-400">{t.routeId?.routeNumber || 'Standard'}</div>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                        <div className="font-semibold">{new Date(t.departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-xs text-slate-400">{new Date(t.departureDate).toLocaleDateString()}</div>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <div className="font-bold text-slate-900 dark:text-white">{t.busId?.busNumber || 'N/A'}</div>
                        <div className="text-xs font-mono text-slate-400">{t.busId?.registrationNumber}</div>
                      </td>

                      <td className="p-4">
                        <select
                          value={t.conductorId?._id || t.conductorId || ''}
                          disabled={isDeparted || isCancelled}
                          onChange={(e) => handleAssignConductor(t._id, e.target.value)}
                          className="text-xs bg-slate-50 dark:bg-[#162038] border border-slate-200 dark:border-[#2a3756] rounded-xl px-3 py-2 outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-medium"
                        >
                          <option value="">Unassigned</option>
                          {conductors.map(c => (
                            <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                          ))}
                        </select>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                          t.status === 'DEPARTED' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                          t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                          'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {!isDeparted && !isCancelled && (
                          <button
                            onClick={() => handleStartJourney(t._id)}
                            className="text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-sm shadow-emerald-500/25 inline-flex items-center gap-1.5"
                          >
                            <Play size={11} fill="currentColor" /> Start Journey
                          </button>
                        )}
                        {isDeparted && (
                          <span className="text-xs text-emerald-500 font-bold inline-flex items-center gap-1 mr-2">
                            <CheckCircle size={13} /> Active
                          </span>
                        )}
                        <button
                          onClick={() => loadManifest(t)}
                          className="text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-xl font-bold border border-slate-200 dark:border-white/10 transition-colors"
                        >
                          Manifest
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredTrips.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No scheduled trips found for this depot.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PASSENGER MANIFEST MODAL ── */}
      {selectedManifestTrip && (
        <div className="auth-stage-overlay">
          <div className="bg-white dark:bg-[#0b132b] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col max-h-[85vh] animate-fade-in">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-[#111a30]">
              <div>
                <h3 className="text-xl font-black font-outfit text-slate-900 dark:text-white">Passenger Manifest</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedManifestTrip.routeId?.routeName} • Bus: {selectedManifestTrip.busId?.busNumber}
                </p>
              </div>
              <button 
                onClick={() => setSelectedManifestTrip(null)} 
                className="p-2 hover:bg-slate-200 dark:hover:bg-[#1e2c4d] rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingManifest ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : !manifestData || manifestData.length === 0 ? (
                <div className="text-center p-8 text-slate-400 font-medium">No passengers booked yet for this trip.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-[#111a30] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="p-3 font-semibold">Seat</th>
                      <th className="p-3 font-semibold">PNR / Passenger</th>
                      <th className="p-3 font-semibold">Boarding</th>
                      <th className="p-3 font-semibold">Dropping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                    {manifestData.map(b => (
                      <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <td className="p-3 font-bold text-emerald-500">{b.seatNumbers?.join(', ')}</td>
                        <td className="p-3">
                          <div className="font-mono text-xs text-slate-400 mb-0.5">{b.bookingNumber}</div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            {b.passengerId?.fullName || `${b.passengerId?.firstName || 'Guest'} ${b.passengerId?.lastName || ''}`}
                            {b.passengerId?.age && (
                              <span className="text-xs font-normal text-slate-400">
                                ({b.passengerId.age}{b.passengerId.gender?.charAt(0)})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{b.boardingPoint?.stopName || 'Origin'}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{b.droppingPoint?.stopName || 'Destination'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontOfficeDashboard;
