import React from 'react';
import { User, Sun, Moon, Compass, Shield, RotateCcw, ChevronRight, ChevronDown, Phone } from 'lucide-react';

const MobileProfileTab = ({
  theme,
  toggleTheme,
  language,
  setLanguage,
  hasActivatedWebApp,
  setHasActivatedWebApp,
  faqExpanded,
  setFaqExpanded,
  onLogout,
  t
}) => {
  return (
    <div className="tab-view-fadein">
      {/* Profile Card */}
      <div className="mobile-profile-card">
        <div className="mp-avatar-container">
          <div className="mp-avatar"><User size={40} /></div>
          <div className="mp-meta">
            <h4>Govind Promod</h4>
            <span className="tier-tag">Gold Tier Traveler</span>
          </div>
        </div>
        <div className="mp-stats-row">
          <div className="stat-col">
            <span className="stat-val">12</span>
            <span className="stat-lbl">Journeys</span>
          </div>
          <div className="stat-col">
            <span className="stat-val">850</span>
            <span className="stat-lbl">Points</span>
          </div>
          <div className="stat-col">
            <span className="stat-val">96%</span>
            <span className="stat-lbl">Punctuality</span>
          </div>
        </div>
        <button className="mp-logout-btn" onClick={onLogout}>
          Sign Out
        </button>
      </div>

      {/* Toggles & Options */}
      <div className="profile-options-section mt-4">
        <h3 className="section-title-compact">Preferences</h3>
        
        <div className="profile-setting-tile">
          <div className="tile-left">
            <Sun size={20} />
            <span>{t.theme}</span>
          </div>
          <button className={`toggle-switch-ui ${theme === 'dark' ? 'on' : ''}`} onClick={toggleTheme}>
            <div className="switch-knob"></div>
          </button>
        </div>

        <div className="profile-setting-tile">
          <div className="tile-left">
            <Compass size={20} />
            <span>{t.language}</span>
          </div>
          <div className="language-selector-badge-group">
            <button className={`lang-badge ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
            <button className={`lang-badge ${language === 'ml' ? 'active' : ''}`} onClick={() => setLanguage('ml')}>മലയാളം</button>
          </div>
        </div>

        <div className="profile-setting-tile">
          <div className="tile-left">
            <Shield size={20} />
            <span>Offline Sync Mode</span>
          </div>
          <button className="toggle-switch-ui on" onClick={() => alert('Offline sync is always active for gold passengers.')}>
            <div className="switch-knob"></div>
          </button>
        </div>
      </div>

      {/* FAQ & Support Section */}
      <div className="profile-options-section mt-4 mb-4">
        <h3 className="section-title-compact">FAQs & Support</h3>
        
        <div className="profile-setting-tile" onClick={() => setHasActivatedWebApp(false)} style={{ cursor: 'pointer' }}>
          <div className="tile-left" style={{ color: 'var(--secondary)' }}>
            <RotateCcw size={20} />
            <span>Return to Website Home</span>
          </div>
          <ChevronRight size={18} />
        </div>
        
        <div className="accordion-item">
          <button className="accordion-trigger" onClick={() => setFaqExpanded({...faqExpanded, 0: !faqExpanded[0]})}>
            <span>How can I refund my tickets?</span>
            <ChevronDown size={18} style={{ transform: faqExpanded[0] ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          {faqExpanded[0] && (
            <div className="accordion-panel">
              <p>Refunds are processed automatically when tickets are cancelled. Full refund applies if cancelled 24 hours prior to departure.</p>
            </div>
          )}
        </div>

        <div className="accordion-item">
          <button className="accordion-trigger" onClick={() => setFaqExpanded({...faqExpanded, 1: !faqExpanded[1]})}>
            <span>What is the baggage limit for K-Swift?</span>
            <ChevronDown size={18} style={{ transform: faqExpanded[1] ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          {faqExpanded[1] && (
            <div className="accordion-panel">
              <p>Up to 20kg of standard luggage is allowed per passenger free of charge. Excess luggage is subject to cargo fares.</p>
            </div>
          )}
        </div>

        <div className="accordion-item">
          <button className="accordion-trigger" onClick={() => setFaqExpanded({...faqExpanded, 2: !faqExpanded[2]})}>
            <span>Corporate Address</span>
            <ChevronDown size={18} style={{ transform: faqExpanded[2] ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          {faqExpanded[2] && (
            <div className="accordion-panel">
              <p>Kerala State Road Transport Corporation (KSRTC), Transport Bhavan, Fort, Trivandrum - Pin 695023</p>
            </div>
          )}
        </div>

        {/* Helpline Dialers */}
        <div className="compact-call-helpline">
          <h4>Need Urgent Support?</h4>
          <div className="button-group">
            <a href="tel:0471-2463799" className="btn-secondary-modern"><Phone size={14} /> Enquiry</a>
            <a href="tel:18005994011" className="btn-secondary-modern"><Phone size={14} /> Toll-Free</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileProfileTab;
