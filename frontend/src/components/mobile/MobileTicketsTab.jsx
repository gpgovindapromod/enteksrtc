import React from 'react';
import { Ticket, Share2 } from 'lucide-react';

const MobileTicketsTab = ({
  activeBookings,
  expandedTicketId,
  setExpandedTicketId,
  handleCancelBooking,
  setActiveMobileTab,
  setIsSearching,
  t
}) => {
  return (
    <div className="tab-view-fadein">
      <div className="tab-header-title">
        <h2>{t.myTickets}</h2>
        <p>Manage and present active boarding passes</p>
      </div>

      {activeBookings.length === 0 ? (
        <div className="empty-tickets-view">
          <Ticket size={48} className="empty-icon" />
          <h4>No Active Tickets</h4>
          <p>Book tickets from the search screen to display them here.</p>
          <button className="btn-primary-modern" onClick={() => { setActiveMobileTab('home'); setIsSearching(false); }}>Book Now</button>
        </div>
      ) : (
        <div className="tickets-list-container">
          {activeBookings.map((ticket) => {
            const isExpanded = expandedTicketId === ticket.id;
            return (
              <div key={ticket.id} className="mobile-ticket-card-group">
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
                    <div className="ticket-sub-details">{ticket.busType}</div>
                  </div>
                  <div className="ticket-body-right">
                    <div className="ticket-price-badge">{ticket.price}</div>
                    <span className="expand-hint">{isExpanded ? 'Close' : 'View'}</span>
                  </div>
                </div>

                {/* Interactive Expandable Bottom Section */}
                {isExpanded && (
                  <div className="ticket-expansion-details">
                    <div className="dash-divider"></div>
                    <div className="expansion-grid">
                      <div className="info-cell">
                        <span className="cell-label">Ticket ID</span>
                        <span className="cell-val">{ticket.id}</span>
                      </div>
                      <div className="info-cell">
                        <span className="cell-label">Seats</span>
                        <span className="cell-val">{ticket.seats.join(', ')}</span>
                      </div>
                      <div className="info-cell">
                        <span className="cell-label">Boarding Status</span>
                        <span className="cell-val pulsing-live">● Ready</span>
                      </div>
                      <div className="info-cell">
                        <span className="cell-label">Traveler</span>
                        <span className="cell-val">Govind Promod</span>
                      </div>
                    </div>

                    <div className="qr-wrapper">
                      <div className="qr-box">
                        <svg width="130" height="130" viewBox="0 0 100 100" style={{ display: 'block', margin: 'auto' }}>
                          <rect width="100" height="100" fill="white" />
                          <rect x="5" y="5" width="25" height="25" fill="black" />
                          <rect x="10" y="10" width="15" height="15" fill="white" />
                          <rect x="13" y="13" width="9" height="9" fill="black" />

                          <rect x="70" y="5" width="25" height="25" fill="black" />
                          <rect x="75" y="10" width="15" height="15" fill="white" />
                          <rect x="78" y="13" width="9" height="9" fill="black" />

                          <rect x="5" y="70" width="25" height="25" fill="black" />
                          <rect x="10" y="75" width="15" height="15" fill="white" />
                          <rect x="13" y="78" width="9" height="9" fill="black" />

                          <rect x="35" y="10" width="10" height="15" fill="black" />
                          <rect x="50" y="5" width="15" height="10" fill="black" />
                          <rect x="35" y="30" width="20" height="10" fill="black" />
                          <rect x="5" y="40" width="15" height="20" fill="black" />
                          <rect x="65" y="35" width="25" height="15" fill="black" />
                          <rect x="35" y="55" width="10" height="25" fill="black" />
                          <rect x="50" y="50" width="25" height="10" fill="black" />
                          <rect x="75" y="70" width="20" height="20" fill="black" />
                          <rect x="60" y="80" width="10" height="15" fill="black" />
                          <rect x="50" y="75" width="5" height="5" fill="black" />
                          <rect x="45" y="90" width="15" height="5" fill="black" />
                          <rect x="80" y="60" width="15" height="5" fill="black" />
                        </svg>
                      </div>
                      <span className="qr-caption">{t.tapToScan}</span>
                    </div>

                    <div className="ticket-actions-group">
                      <button className="btn-cancel-ticket" onClick={() => {
                        if (window.confirm("Are you sure you want to cancel this ticket? Full refund applies up to 24h before journey.")) {
                          handleCancelBooking(ticket.id);
                        }
                      }}>
                        Cancel Journey
                      </button>
                      <button className="btn-share-ticket" onClick={() => alert(`Sharing Ticket ${ticket.id} with options...`)}>
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
