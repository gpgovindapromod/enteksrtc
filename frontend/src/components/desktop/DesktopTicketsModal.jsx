import React from 'react';

const DesktopTicketsModal = ({ show, onClose, activeBookings, handleCancelBooking }) => {
  if (!show) return null;
  return (
    <div className="desktop-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="desktop-modal-content" style={{
        backgroundColor: 'var(--white)',
        color: 'var(--dark)',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '650px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Boarding Passes</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {activeBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No Active Tickets Found</p>
            <p style={{ fontSize: '0.9rem' }}>You can book new tickets from the home screen.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeBookings.map((ticket) => (
              <div key={ticket.id} style={{
                border: '1px solid var(--gray-light)',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: 'var(--light)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--dark)' }}>{ticket.from} → {ticket.to}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{ticket.date} • {ticket.time}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{ticket.busType}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{ticket.price}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Seats: {ticket.seats.join(', ')}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--gray-light)', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>Ready for Boarding</span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this ticket?')) {
                        handleCancelBooking(ticket.id);
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Cancel Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopTicketsModal;
