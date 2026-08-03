import React from 'react';
import { Sun, Moon, Bell, Ticket, Bus } from 'lucide-react';

const MobileAppHeader = ({
  theme,
  toggleTheme,
  showNotifications,
  setShowNotifications,
  isUserLoggedIn,
  setShowLoginModal
}) => {
  return (
    <header className="mobile-app-header">
      <div className="app-header-left">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLWQfS0R2m1lTTNcpBqGKE8oBi2RxmC27R_wcpV3v8BQ&s=10" alt="KSRTC" className="ksrtc-logo-app" width="40" height="40" />
        <div className="app-brand-text">
          <span className="app-title">Ente KSRTC</span>
          <span className="app-subtitle">Premium Journey</span>
        </div>
      </div>
      <div className="app-header-right">
        {/* Render mini Login button only if logged out */}
        {!isUserLoggedIn && (
          <button
            className="btn-login-app"
            onClick={() => setShowLoginModal(true)}
          >
            Login
          </button>
        )}

        <button className="app-header-icon" aria-label="Toggle Theme" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="app-header-icon relative" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
          <Bell size={20} />
          <span className="bell-badge"></span>
        </button>
      </div>

      {showNotifications && (
        <div className="mobile-notification-panel" onClick={(e) => e.stopPropagation()}>
          <div className="notif-header">
            <h4>Notifications</h4>
            <button className="notif-clear-btn" onClick={() => setShowNotifications(false)}>Close</button>
          </div>
          <div className="notif-list">
            <div className="notif-item">
              <div className="notif-icon-box blue"><Ticket size={16} /></div>
              <div className="notif-content">
                <p><strong>Ticket Confirmed!</strong> Trivandrum to Bangalore on 05 Aug is confirmed.</p>
                <span>1 hour ago</span>
              </div>
            </div>
            <div className="notif-item">
              <div className="notif-icon-box green"><Bus size={16} /></div>
              <div className="notif-content">
                <p><strong>Schedule Update:</strong> All K-Swift premium services are running on schedule today.</p>
                <span>3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileAppHeader;
