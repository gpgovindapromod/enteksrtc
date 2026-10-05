import React from 'react';
import { CheckCircle2, XCircle, Clock, X, Bus, MapPin, User, CreditCard, Hash, ArrowRight } from 'lucide-react';

const statusColors = {
  CONFIRMED: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: '✓ Confirmed' },
  PENDING:   { bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500',   label: '⏳ Pending Payment' },
  CANCELLED: { bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-700 dark:text-red-400',       dot: 'bg-red-500',     label: '✕ Cancelled' },
  FAILED:    { bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-700 dark:text-red-400',       dot: 'bg-red-500',     label: '✕ Failed' },
};

const paymentColors = {
  PAID:     { text: 'text-emerald-600 dark:text-emerald-400', label: 'Paid' },
  PENDING:  { text: 'text-amber-600 dark:text-amber-400',   label: 'Pending' },
  FAILED:   { text: 'text-red-600 dark:text-red-400',       label: 'Failed' },
  REFUNDED: { text: 'text-blue-600 dark:text-blue-400',     label: 'Refunded' },
};

const DesktopTicketsModal = ({ show, onClose, activeBookings, handleCancelBooking }) => {
  if (!show) return null;

  return (
    <div
      className="desktop-modal-overlay fixed inset-0 z-[10000] flex justify-center items-center backdrop-blur-sm bg-black/60"
      onClick={onClose}
    >
      <div
        className="desktop-modal-content bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-3xl p-7 w-full max-w-3xl shadow-2xl max-h-[88vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold m-0 text-gray-900 dark:text-white">My Boarding Passes</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeBookings.length} ticket(s)</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {activeBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <Bus size={52} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>No Tickets Found</p>
            <p style={{ fontSize: '0.9rem' }}>Book your journey from the home screen.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeBookings.map((ticket) => {
              const bStatus = statusColors[ticket.bookingStatus] || statusColors.CONFIRMED;
              const pStatus = paymentColors[ticket.paymentStatus] || paymentColors.PAID;
              const isCancelled = ticket.bookingStatus === 'CANCELLED';

              return (
                <div
                  key={ticket.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    opacity: isCancelled ? 0.7 : 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Status Bar */}
                  <div className={bStatus.bg} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: bStatus.dot === 'bg-emerald-500' ? '#10b981' : bStatus.dot === 'bg-amber-500' ? '#f59e0b' : '#ef4444' }} />
                    <span className={bStatus.text} style={{ fontSize: '0.8rem', fontWeight: 700 }}>{bStatus.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>{ticket.bookingNumber || ticket.id}</span>
                  </div>

                  {/* Main body */}
                  <div style={{ padding: '16px' }}>
                    {/* Route */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{ticket.from}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{ticket.time}</div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: 2, position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', padding: '0 8px' }}>
                            <ArrowRight size={14} color="#10b981" />
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{ticket.distanceKm ? `${ticket.distanceKm} km` : ''}</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{ticket.to}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{ticket.date}</div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                        <div className="text-[0.7rem] text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Bus size={11} /> Bus
                        </div>
                        <div className="text-[0.85rem] font-bold text-gray-900 dark:text-white">{ticket.busType || '—'}</div>
                        <div className="text-[0.75rem] text-gray-500 dark:text-gray-400">{ticket.busNumber || ''}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                        <div className="text-[0.7rem] text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <MapPin size={11} /> Seats
                        </div>
                        <div className="text-[0.85rem] font-bold text-gray-900 dark:text-white">{ticket.seats?.join(', ') || '—'}</div>
                        <div className="text-[0.75rem] text-gray-500 dark:text-gray-400">{ticket.seats?.length} seat(s)</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                        <div className="text-[0.7rem] text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <CreditCard size={11} /> Fare
                        </div>
                        <div className="text-[0.95rem] font-extrabold text-emerald-500 dark:text-emerald-400">{ticket.price}</div>
                        <div className={`text-[0.7rem] font-bold ${pStatus.text}`}>{pStatus.label}</div>
                      </div>
                    </div>

                    {/* Passengers */}
                    {ticket.passengers && ticket.passengers.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[0.75rem] text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                          <User size={11} /> Passengers
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ticket.passengers.map((p, i) => (
                            <div key={i} className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-2.5 py-1 text-[0.78rem] text-emerald-700 dark:text-emerald-400 font-medium">
                              {p.passengerName} · Seat {p.seatNo} · {p.age}y · {p.gender}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment reference */}
                    {ticket.paymentTransactionId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                        <Hash size={12} color="#9ca3af" />
                        <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Payment ref:</span>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#6b7280' }}>{ticket.paymentTransactionId}</span>
                      </div>
                    )}

                    {/* QR Code */}
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 bg-white rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-2 shadow-sm overflow-hidden">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qrCode || ticket.bookingNumber || ticket.id}`} 
                          alt="Ticket QR Code" 
                          className={`w-full h-full object-contain ${isCancelled ? 'opacity-30 grayscale' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    {!isCancelled && (
                      <div className="flex justify-end border-t border-gray-100 dark:border-white/5 pt-4 mt-4">
                        <button
                          onClick={() => {
                            if (window.confirm('Cancel this booking?')) handleCancelBooking(ticket.id);
                          }}
                          className="px-4 py-1.5 border border-red-500 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopTicketsModal;
