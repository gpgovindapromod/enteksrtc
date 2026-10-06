import React from 'react';
import { Ticket, Share2, Bus, MapPin, User, CreditCard, Hash, ArrowRight, X, Download } from 'lucide-react';
import { downloadTicketPDF } from '../../utils/pdfUtils.jsx';
import { useAuthStore } from '../../store/useAuthStore';

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
  const [qrPopup, setQrPopup] = React.useState(null);
  
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

                    {/* QR Code and Seat Display aligned */}
                    <div className="flex flex-col items-center justify-center my-6 gap-2">
                      <div className="text-center font-bold text-lg text-emerald-600 dark:text-emerald-400 mb-2">
                        SEAT(S): {ticket.seats?.join(', ') || '—'}
                      </div>
                      <div 
                        className={`w-32 h-32 bg-white border border-gray-200 p-2 rounded-xl shadow-sm transition-opacity ${!isCancelled ? 'cursor-pointer hover:opacity-80' : 'opacity-40 grayscale cursor-not-allowed'}`} 
                        onClick={() => {
                           if (!isCancelled) setQrPopup(ticket.qrCode || ticket.bookingNumber || ticket.id);
                        }}
                      >
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qrCode || ticket.bookingNumber || ticket.id}`} 
                          alt="Ticket QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{t?.tapToScan || 'Tap QR to scan at boarding'}</span>
                    </div>

                                        {/* Actions */}
                    <div className="ticket-actions-group">
                      {ticket.bookingStatus !== 'CANCELLED' && (
                        <button
                          className="btn-share-ticket" style={{color: '#10b981', borderColor: '#10b981'}}
                          onClick={() => downloadTicketPDF(ticket, useAuthStore.getState().user, 'KSRTC_Ticket_' + (ticket.bookingNumber || ticket.id) + '.pdf')}
                        >
                          <Download size={16} /> Download
                        </button>
                      )}
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
      {/* QR Code Modal Popup */}
      {qrPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up" onClick={() => setQrPopup(null)}>
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="w-full flex justify-end mb-2">
              <button onClick={() => setQrPopup(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            <h3 className="text-xl font-bold font-outfit text-gray-900 mb-6 text-center">Boarding Pass QR</h3>
            <div className="bg-white p-4 border-2 border-dashed border-gray-200 rounded-2xl mb-6 shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrPopup}`} 
                alt="Enlarged Ticket QR" 
                className="w-56 h-56 mx-auto object-contain"
              />
            </div>
            <p className="text-sm font-bold text-gray-500 mb-6 font-mono text-center tracking-widest bg-gray-100 px-4 py-2 rounded-xl">
              PNR: {qrPopup}
            </p>
            <p className="text-xs text-gray-400 text-center max-w-[200px]">Show this QR code to the conductor when boarding</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileTicketsTab;



