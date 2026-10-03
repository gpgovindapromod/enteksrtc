import React from 'react';
import { Ticket, Share2, Bus, MapPin, User, CreditCard, Hash, ArrowRight, X } from 'lucide-react';

const statusColors = {
  CONFIRMED: { cls: 'pulsing-live', label: '● Confirmed', color: '#10b981' },
  PENDING:   { cls: '',            label: '⏳ Pending',  color: '#f59e0b' },
  CANCELLED: { cls: '',            label: '✕ Cancelled', color: '#ef4444' },
  FAILED:    { cls: '',            label: '✕ Failed',    color: '#ef4444' },
};

const MobileTicketsTab = ({
  activeBookings,
  expandedTicketId,
  setExpandedTicketId,
  handleCancelBooking,
  setActiveMobileTab,
  setIsSearching,
  t,
}) => {
  return (
    <div className="tab-view-fadein">
      <div className="tab-header-title">
        <h2>{t?.myTickets || 'My Tickets'}</h2>
        <p>Manage and present active boarding passes</p>
      </div>

      {activeBookings.length === 0 ? (
        <div className="empty-tickets-view">
          <Ticket size={48} className="empty-icon" />
          <h4>No Active Tickets</h4>
          <p>Book tickets from the search screen to display them here.</p>
          <button
            className="btn-primary-modern"
            onClick={() => { setActiveMobileTab('home'); setIsSearching(false); }}
          >
            Book Now
          </button>
        </div>
      ) : (
        <div className="tickets-list-container">
          {activeBookings.map((ticket) => {
            const isExpanded = expandedTicketId === ticket.id;
            const bStatus = statusColors[ticket.bookingStatus] || statusColors.CONFIRMED;
            const isCancelled = ticket.bookingStatus === 'CANCELLED';

            return (
              <div
                key={ticket.id}
                className="mobile-ticket-card-group"
                style={{ opacity: isCancelled ? 0.72 : 1 }}
              >
                {/* Collapsed card */}
                <div
                  className={`mobile-ticket-visual ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                >
                  <div className="ticket-body-left">
                    <div className="ticket-date-tag">{ticket.date} • {ticket.time}</div>
                    <div className="ticket-route-nodes">
                      <span className="node">{ticket.from}</span>
                      <span className="arrow">→</span>
                      <span className="node">{ticket.to}</span>
                    </div>
                    <div className="ticket-sub-details">
                      {ticket.busType}
                      {ticket.busNumber ? ` · ${ticket.busNumber}` : ''}
                    </div>
                  </div>
                  <div className="ticket-body-right">
                    <div className="ticket-price-badge">{ticket.price}</div>
                    <span className="expand-hint">{isExpanded ? 'Close' : 'View'}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="ticket-expansion-details">
                    <div className="dash-divider" />

                    {/* Status + PNR */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: bStatus.color }}>
                        {bStatus.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#9ca3af' }}>
                        {ticket.bookingNumber || ticket.id}
                      </span>
                    </div>

                    <div className="expansion-grid">
                      <div className="info-cell">
                        <span className="cell-label">Boarding</span>
                        <span className="cell-val">{ticket.from}</span>
                      </div>
                      <div className="info-cell">
                        <span className="cell-label">Dropping</span>
                        <span className="cell-val">{ticket.to}</span>
                      </div>
                      <div className="info-cell">
                        <span className="cell-label">Seats</span>
                        <span className="cell-val">{ticket.seats?.join(', ') || '—'}</span>
                      </div>
                      <div className="info-cell">
                        <span className="cell-label">Distance</span>
                        <span className="cell-val">{ticket.distanceKm ? `${ticket.distanceKm} km` : '—'}</span>
                      </div>
                      <div className="info-cell">
                        <span className="cell-label">Bus Type</span>
                        <span className="cell-val">{ticket.busType || '—'}</span>
                      </div>
                      <div className="info-cell">
                        <span className="cell-label">Payment</span>
                        <span className="cell-val" style={{ color: ticket.paymentStatus === 'PAID' ? '#10b981' : ticket.paymentStatus === 'FAILED' ? '#ef4444' : '#f59e0b' }}>
                          {ticket.paymentStatus || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Passengers */}
                    {ticket.passengers && ticket.passengers.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={10} /> Passengers
                        </div>
                        {ticket.passengers.map((p, i) => (
                          <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '5px 10px', background: 'rgba(16,185,129,0.08)', borderRadius: 8,
                            marginBottom: 4, fontSize: '0.78rem',
                          }}>
                            <span style={{ fontWeight: 700 }}>{p.passengerName}</span>
                            <span style={{ color: '#6b7280' }}>Seat {p.seatNo} · {p.age}y · {p.gender?.[0]}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment ref */}
                    {ticket.paymentTransactionId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                        <Hash size={10} color="#9ca3af" />
                        <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Ref: </span>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#6b7280' }}>
                          {ticket.paymentTransactionId}
                        </span>
                      </div>
                    )}

                    {/* QR */}
                    <div className="qr-wrapper">
                      <div className="qr-box">
                        <svg width="130" height="130" viewBox="0 0 100 100" style={{ display: 'block', margin: 'auto' }}>
                          <rect width="100" height="100" fill="white" />
                          <rect x="5" y="5" width="25" height="25" fill="black" /><rect x="10" y="10" width="15" height="15" fill="white" /><rect x="13" y="13" width="9" height="9" fill="black" />
                          <rect x="70" y="5" width="25" height="25" fill="black" /><rect x="75" y="10" width="15" height="15" fill="white" /><rect x="78" y="13" width="9" height="9" fill="black" />
                          <rect x="5" y="70" width="25" height="25" fill="black" /><rect x="10" y="75" width="15" height="15" fill="white" /><rect x="13" y="78" width="9" height="9" fill="black" />
                          <rect x="35" y="10" width="10" height="15" fill="black" /><rect x="50" y="5" width="15" height="10" fill="black" />
                          <rect x="35" y="30" width="20" height="10" fill="black" /><rect x="5" y="40" width="15" height="20" fill="black" />
                          <rect x="65" y="35" width="25" height="15" fill="black" /><rect x="35" y="55" width="10" height="25" fill="black" />
                          <rect x="50" y="50" width="25" height="10" fill="black" /><rect x="75" y="70" width="20" height="20" fill="black" />
                          <rect x="60" y="80" width="10" height="15" fill="black" /><rect x="50" y="75" width="5" height="5" fill="black" />
                          <rect x="45" y="90" width="15" height="5" fill="black" /><rect x="80" y="60" width="15" height="5" fill="black" />
                        </svg>
                      </div>
                      <span className="qr-caption">{t?.tapToScan || 'Tap to scan at boarding'}</span>
                    </div>

                    {/* Actions */}
                    <div className="ticket-actions-group">
                      {!isCancelled && (
                        <button
                          className="btn-cancel-ticket"
                          onClick={() => {
                            if (window.confirm('Cancel this booking? Refund will be processed if applicable.')) {
                              handleCancelBooking(ticket.id);
                            }
                          }}
                        >
                          Cancel Journey
                        </button>
                      )}
                      <button
                        className="btn-share-ticket"
                        onClick={() => alert(`Sharing Ticket ${ticket.id} …`)}
                      >
                        <Share2 size={16} /> Share Pass
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileTicketsTab;
