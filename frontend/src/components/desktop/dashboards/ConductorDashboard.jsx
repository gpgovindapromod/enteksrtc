import React from 'react';
import {
  AlertCircle,
  Bell,
  Bus,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  Route,
  UserRound,
  Users,
  XCircle
} from 'lucide-react';
import { useNotifications } from '../../../hooks/useNotifications';
import { NotificationItem } from '../../notifications/NotificationItem';

const dateTime = (value, options = {}) => {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options
  });
};

const statusStyles = {
  AVAILABLE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  OCCUPIED: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
  HELD: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  BLOCKED: 'border-slate-400/30 bg-slate-400/10 text-slate-500 dark:text-slate-400'
};

const statusLabels = {
  AVAILABLE: 'Vacant',
  OCCUPIED: 'Occupied',
  HELD: 'Held',
  BLOCKED: 'Blocked'
};

const ConductorDashboard = ({ data, loading, activeTab = 'My Route' }) => {
  const { notifications, unreadCount, markOneRead } = useNotifications();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading your duty board...</p>
      </div>
    );
  }

  const trip = data?.currentTrip;
  const seats = data?.seats || [];
  const summary = data?.seatSummary || { total: 0, occupied: 0, held: 0, available: 0, blocked: 0 };
  const manifest = data?.manifest || [];
  const upcomingTrips = data?.upcomingTrips || [];
  const rows = seats.reduce((groups, seat) => {
    const row = seat.row || 1;
    groups[row] = groups[row] || [];
    groups[row].push(seat);
    return groups;
  }, {});
  const sortedRows = Object.entries(rows).sort(([a], [b]) => Number(a) - Number(b));

  if (!trip) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <div className="ente-badge-pill mb-2"><Bus size={12} /> Field Operations</div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Conductor Console
          </h2>
        </div>
        <div className="ente-card-glass p-10 text-center">
          <CalendarClock className="mx-auto text-slate-400" size={42} />
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No upcoming duty assigned</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Your next bus, driver, and passenger manifest will appear here after the Station Master assigns a trip.
          </p>
        </div>
      </div>
    );
  }

  const showManifest = activeTab === 'Manifest' || activeTab === 'Scan Tickets';

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="ente-badge-pill mb-2"><Bus size={12} /> Field Operations</div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {showManifest ? 'Passenger Manifest' : "Today's Duty Board"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep the assigned bus, driver, and boarding status in view before departure.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="ente-badge-pill border-emerald-500/40 animate-pulse">{unreadCount} new alerts</span>
        )}
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <div className="ente-card-glass p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assigned bus & route</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {trip.busNumber || trip.registrationNumber || 'Bus pending'}
              </h3>
              <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{trip.route}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {trip.status}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-white/10">
            <div className="flex gap-3 items-center">
              <Clock3 size={18} className="text-emerald-500" />
              <div><p className="text-[10px] uppercase font-bold text-slate-400">Departure</p><p className="text-sm font-bold text-slate-800 dark:text-white">{dateTime(trip.departureDate)}</p></div>
            </div>
            <div className="flex gap-3 items-center">
              <Route size={18} className="text-blue-500" />
              <div><p className="text-[10px] uppercase font-bold text-slate-400">Service</p><p className="text-sm font-bold text-slate-800 dark:text-white">{trip.busType || 'Scheduled service'}</p></div>
            </div>
            <div className="flex gap-3 items-center">
              <MapPin size={18} className="text-orange-500" />
              <div><p className="text-[10px] uppercase font-bold text-slate-400">Registration</p><p className="text-sm font-bold text-slate-800 dark:text-white">{trip.registrationNumber || 'Pending'}</p></div>
            </div>
          </div>
        </div>

        <div className="ente-card-glass p-6">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Accompanying driver</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><UserRound size={23} /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{trip.driver?.name || 'Driver not assigned'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{trip.driver?.employeeId || 'Employee ID unavailable'}</p>
            </div>
          </div>
          {trip.driver?.phone && (
            <a href={`tel:${trip.driver.phone}`} className="mt-5 flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <Phone size={15} /> {trip.driver.phone}
            </a>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          ['Total seats', summary.total, Users, 'text-blue-500'],
          ['Occupied', summary.occupied, XCircle, 'text-rose-500'],
          ['Vacant', summary.available, CheckCircle2, 'text-emerald-500'],
          ['Held', summary.held, Clock3, 'text-amber-500'],
          ['Blocked', summary.blocked, AlertCircle, 'text-slate-500']
        ].map(([label, value, Icon, color]) => (
          <div key={label} className="ente-card-glass p-4">
            <Icon size={18} className={color} />
            <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{value}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
          </div>
        ))}
      </section>

      <section className="ente-card-glass p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Seat management</h3>
            <p className="text-xs text-slate-400 mt-1">Live seat vacancy and passenger occupancy for this duty.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
            {Object.entries(statusLabels).map(([status, label]) => (
              <span key={status} className={`px-2.5 py-1 rounded-full border ${statusStyles[status]}`}>{label}</span>
            ))}
          </div>
        </div>
        {sortedRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No seat layout has been configured for this bus.</p>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[360px] max-w-3xl mx-auto space-y-2">
              {sortedRows.map(([row, rowSeats]) => (
                <div key={row} className="flex items-center gap-2">
                  <span className="w-8 text-xs font-bold text-slate-400">R{row}</span>
                  <div className="flex flex-wrap gap-2">
                    {rowSeats.sort((a, b) => (a.column || 0) - (b.column || 0)).map(seat => (
                      <div
                        key={seat.seatNo}
                        title={seat.passengerName ? `${seat.seatNo}: ${seat.passengerName}` : `Seat ${seat.seatNo}`}
                        className={`w-12 h-10 rounded-lg border flex items-center justify-center text-xs font-black ${statusStyles[seat.status] || statusStyles.AVAILABLE}`}
                      >
                        {seat.seatNo}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="ente-card-glass overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/10">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Confirmed passenger manifest</h3>
          <p className="text-xs text-slate-400 mt-1">{manifest.length} passenger seat assignment{manifest.length === 1 ? '' : 's'}</p>
        </div>
        {manifest.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No confirmed passengers for this duty yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/[0.03] text-[10px] uppercase tracking-wider text-slate-400">
                <tr><th className="p-4">Seat</th><th className="p-4">Passenger</th><th className="p-4">Boarding</th><th className="p-4">Dropping</th><th className="p-4">Booking</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {manifest.map(passenger => (
                  <tr key={`${passenger.bookingId}-${passenger.seatNo}`} className="text-slate-700 dark:text-slate-300">
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">{passenger.seatNo}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{passenger.passengerName}<div className="text-xs font-normal text-slate-400">{passenger.phone || 'Phone unavailable'}</div></td>
                    <td className="p-4"><span className="inline-flex items-center gap-1"><MapPin size={13} />{passenger.boardingStop}</span></td>
                    <td className="p-4"><span className="inline-flex items-center gap-1"><MapPin size={13} />{passenger.droppingStop}</span></td>
                    <td className="p-4 text-xs font-mono text-slate-400">{passenger.bookingNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="ente-card-glass p-6">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Upcoming duties</h3>
        <div className="space-y-3">
          {upcomingTrips.map(nextTrip => (
            <div key={nextTrip.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10">
              <div><p className="font-bold text-slate-900 dark:text-white">{nextTrip.route}</p><p className="text-xs text-slate-400 mt-1">{nextTrip.busNumber || nextTrip.registrationNumber || 'Bus pending'} · Driver: {nextTrip.driver}</p></div>
              <div className="text-left md:text-right"><p className="text-sm font-bold text-slate-800 dark:text-slate-200">{dateTime(nextTrip.departureDate)}</p><span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">{nextTrip.status}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="ente-card-glass p-7 overflow-hidden">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/10">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500"><Bell size={18} /></div>
          <div><h3 className="font-extrabold text-base text-slate-900 dark:text-white">Trip alerts</h3><p className="text-xs text-slate-400">Cancellations, reassignment, and manifest updates</p></div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
          {notifications.length === 0 ? <div className="py-6 text-center text-xs text-slate-400">No active trip alerts.</div> : notifications.map(notif => <NotificationItem key={notif._id} notification={notif} onMarkRead={markOneRead} />)}
        </div>
      </section>
    </div>
  );
};

export default ConductorDashboard;
