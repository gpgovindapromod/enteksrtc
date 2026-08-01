import React from 'react';
import { X, Bus, RotateCcw } from 'lucide-react';

const MobileLiveTracking = ({
  showLiveTracking,
  setShowLiveTracking,
  trackingStep,
  setTrackingStep
}) => {
  if (!showLiveTracking) return null;

  return (
    <div className="mobile-sheet-overlay" onClick={() => setShowLiveTracking(false)}>
      <div className="mobile-bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle"></div>
        <div className="sheet-header">
          <h3>Live Bus Tracking (TVM - BLR)</h3>
          <button className="sheet-close" onClick={() => setShowLiveTracking(false)}><X size={20} /></button>
        </div>
        <div className="sheet-body">
          <div className="tracking-map-container">
            <div className="tracking-map-path">
              <div className="map-line"></div>
              <div className="map-progress-line" style={{ height: `${(trackingStep / 5) * 100}%` }}></div>
              
              <div className={`map-stop ${trackingStep >= 0 ? 'active' : ''}`}>
                <div className="stop-marker"></div>
                <span className="stop-name">Trivandrum (18:30)</span>
              </div>
              <div className={`map-stop ${trackingStep >= 1 ? 'active' : ''}`}>
                <div className="stop-marker"></div>
                <span className="stop-name">Kollam (19:45)</span>
              </div>
              <div className={`map-stop ${trackingStep >= 2 ? 'active' : ''}`}>
                <div className="stop-marker"></div>
                <span className="stop-name">Ernakulam (22:15)</span>
              </div>
              <div className={`map-stop ${trackingStep >= 3 ? 'active' : ''}`}>
                <div className="stop-marker"></div>
                <span className="stop-name">Thrissur (23:45)</span>
              </div>
              <div className={`map-stop ${trackingStep >= 4 ? 'active' : ''}`}>
                <div className="stop-marker"></div>
                <span className="stop-name">Palakkad (01:30)</span>
              </div>
              <div className={`map-stop ${trackingStep >= 5 ? 'active' : ''}`}>
                <div className="stop-marker"></div>
                <span className="stop-name">Bangalore (08:45)</span>
              </div>
              
              {/* Floating Bus Icon */}
              <div className="tracking-bus-icon" style={{ top: `${(trackingStep / 5) * 100}%` }}>
                <Bus size={18} />
              </div>
            </div>
          </div>
          <div className="tracking-status-card">
            <div className="status-header">
              <span className="status-badge live">LIVE</span>
              <h4>K-Swift Premium #8920</h4>
            </div>
            <p>Next stop: <strong>{['Kollam', 'Ernakulam', 'Thrissur', 'Palakkad', 'Bangalore', 'Arrived!'][trackingStep]}</strong></p>
            <p className="status-update">Last updated just now. Speed: 64 km/h</p>
            <button className="btn-secondary-modern full-width" onClick={() => setTrackingStep((prev) => (prev + 1) % 6)}>
              <RotateCcw size={16} /> Force Move Bus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLiveTracking;
