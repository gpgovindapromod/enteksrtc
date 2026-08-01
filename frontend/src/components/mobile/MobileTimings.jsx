import React from 'react';
import { X } from 'lucide-react';

const MobileTimings = ({
  showTimingsModal,
  setShowTimingsModal
}) => {
  if (!showTimingsModal) return null;

  return (
    <div className="mobile-sheet-overlay" onClick={() => setShowTimingsModal(false)}>
      <div className="mobile-bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>
        <div className="sheet-header">
          <h3>Today's Timetable</h3>
          <button className="sheet-close" onClick={() => setShowTimingsModal(false)}><X size={20} /></button>
        </div>
        <div className="sheet-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="compact-timings-list">
            <div className="timing-item">
              <div>
                <div className="timing-line"><strong>06:00</strong> Trivandrum - Bangalore</div>
                <div className="timing-type">Swift Deluxe (AC)</div>
              </div>
              <span className="timing-status schedule">On Schedule</span>
            </div>
            <div className="timing-item">
              <div>
                <div className="timing-line"><strong>09:30</strong> Trivandrum - Kochi</div>
                <div className="timing-type">Fast Passenger (Non-AC)</div>
              </div>
              <span className="timing-status delayed">15m Delayed</span>
            </div>
            <div className="timing-item">
              <div>
                <div className="timing-line"><strong>18:30</strong> Trivandrum - Bangalore</div>
                <div className="timing-type">K-Swift Sleeper (AC)</div>
              </div>
              <span className="timing-status schedule">On Schedule</span>
            </div>
            <div className="timing-item">
              <div>
                <div className="timing-line"><strong>20:00</strong> Trivandrum - Calicut</div>
                <div className="timing-type">Minnal Express</div>
              </div>
              <span className="timing-status schedule">On Schedule</span>
            </div>
            <div className="timing-item">
              <div>
                <div className="timing-line"><strong>22:15</strong> Trivandrum - Palakkad</div>
                <div className="timing-type">Super Fast (Non-AC)</div>
              </div>
              <span className="timing-status cancelled">Cancelled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTimings;
