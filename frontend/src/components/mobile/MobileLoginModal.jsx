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
          <button className="sheet-close" onClick={() => setShowLoginModal(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="sheet-body">
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
              <div className="auth-input-group">
                <Mail size={18} className="auth-icon" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="auth-input-group">
                <Lock size={18} className="auth-icon" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {authMode === 'signup' && (
                <div className="auth-input-group">
                  <User size={18} className="auth-icon" />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
              )}

              <button type="submit" className="btn-primary-modern auth-btn">
                {authMode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
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
