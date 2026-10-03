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
      className="desktop-modal-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 10000,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="desktop-modal-content"
        style={{
          backgroundColor: 'var(--white)',
          color: 'var(--dark)',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '720px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>My Boarding Passes</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 4 }}>{activeBookings.length} ticket(s)</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6', border: 'none', borderRadius: '50%',
              width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} color="#374151" />
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Bus size={11} /> Bus
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{ticket.busType || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{ticket.busNumber || ''}</div>
                      </div>
                      <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} /> Seats
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{ticket.seats?.join(', ') || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{ticket.seats?.length} seat(s)</div>
                      </div>
                      <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CreditCard size={11} /> Fare
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>{ticket.price}</div>
                        <div className={pStatus.text} style={{ fontSize: '0.7rem', fontWeight: 700 }}>{pStatus.label}</div>
                      </div>
                    </div>

                    {/* Passengers */}
                    {ticket.passengers && ticket.passengers.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={11} /> Passengers
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {ticket.passengers.map((p, i) => (
                            <div key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', color: '#065f46' }}>
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

                    {/* QR placeholder */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                      <div style={{
                        width: 100, height: 100, background: '#f9fafb', border: '1px dashed #d1d5db',
                        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6,
                      }}>
                        <svg width="60" height="60" viewBox="0 0 100 100">
                          <rect width="100" height="100" fill="white" />
                          <rect x="5" y="5" width="25" height="25" fill="black" /><rect x="10" y="10" width="15" height="15" fill="white" /><rect x="13" y="13" width="9" height="9" fill="black" />
                          <rect x="70" y="5" width="25" height="25" fill="black" /><rect x="75" y="10" width="15" height="15" fill="white" /><rect x="78" y="13" width="9" height="9" fill="black" />
                          <rect x="5" y="70" width="25" height="25" fill="black" /><rect x="10" y="75" width="15" height="15" fill="white" /><rect x="13" y="78" width="9" height="9" fill="black" />
                          <rect x="35" y="10" width="10" height="15" fill="black" /><rect x="50" y="5" width="15" height="10" fill="black" />
                          <rect x="35" y="55" width="10" height="25" fill="black" /><rect x="50" y="50" width="25" height="10" fill="black" />
                        </svg>
                        <span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{ticket.id}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isCancelled && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            if (window.confirm('Cancel this booking?')) handleCancelBooking(ticket.id);
                          }}
                          style={{
                            background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
                            padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                          }}
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
