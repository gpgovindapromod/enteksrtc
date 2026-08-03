import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';

const MobileLoginModal = ({
  showLoginModal,
  setShowLoginModal,
  onLoginSuccess
}) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!showLoginModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || (authMode === 'signup' && !fullName)) {
      alert('Please fill out all required fields.');
      return;
    }
    // Perform mock login
    onLoginSuccess();
    setShowLoginModal(false);
  };

  return (
    <div className="mobile-sheet-overlay" onClick={() => setShowLoginModal(false)}>
      <div className="mobile-bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: '30px' }}>
        <div className="sheet-handle"></div>
        <div className="sheet-header">
          <h3>Ente KSRTC Account</h3>
          <button className="sheet-close" aria-label="Close Login Modal" onClick={() => setShowLoginModal(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="sheet-body">
          <div style={{ backgroundColor: '#ff4444', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px', marginBottom: '15px' }}>
            ⚠️ ACADEMIC DEMO: Do not enter real credentials.
          </div>
          <div className="mobile-auth-card" style={{ boxShadow: 'none', border: 'none', padding: 0, marginBottom: 0 }}>
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </button>
              <button 
                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-light)' }}>
                For security reasons in this academic project, login forms have been disabled.
              </div>
              <button type="submit" className="btn-primary-modern auth-btn">
                CONTINUE AS GUEST
              </button>
            </form>

            <p className="auth-footer-text">
              {authMode === 'login' ? (
                <>Don't have an account? <span onClick={() => setAuthMode('signup')}>Sign Up</span></>
              ) : (
                <>Already have an account? <span onClick={() => setAuthMode('login')}>Sign In</span></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginModal;
