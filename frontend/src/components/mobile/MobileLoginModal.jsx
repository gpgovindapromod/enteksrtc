import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const MobileLoginModal = ({
  showLoginModal,
  setShowLoginModal,
  onLoginSuccess
}) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupTab, setSignupTab] = useState('mandatory');

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

            <form onSubmit={handleSubmit} className="modern-auth-form mobile-form">
              {authMode === 'signup' && (
                <>
                  <div className="signup-sub-tabs">
                    <button 
                      type="button"
                      className={`sub-tab ${signupTab === 'mandatory' ? 'active' : ''}`}
                      onClick={() => setSignupTab('mandatory')}
                    >
                      MANDATORY INFO
                    </button>
                    <button 
                      type="button"
                      className={`sub-tab ${signupTab === 'optional' ? 'active' : ''}`}
                      onClick={() => setSignupTab('optional')}
                    >
                      OPTIONAL INFO
                    </button>
                  </div>

                  {signupTab === 'mandatory' ? (
                    <div className="tab-pane fade-in">
                      <div className="input-group">
                        <input type="text" aria-label="Name" placeholder="NAME" required />
                      </div>
                      <div className="input-group">
                        <input type="number" aria-label="Age" placeholder="Age" required />
                      </div>
                      <div className="input-group">
                        <input type="email" aria-label="Email ID" placeholder="EMAIL ID" required />
                      </div>
                      <div className="input-group">
                        <input type={showPassword ? "text" : "password"} aria-label="Password" placeholder="Password" required />
                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <div className="input-group select-group">
                        <label className="floating-label">GENDER</label>
                        <select required>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="tab-pane fade-in">
                      <div className="input-group">
                        <input type="text" aria-label="GST Company" placeholder="GST COMPANY" />
                      </div>
                      <div className="input-group">
                        <input type="text" aria-label="GST Number" placeholder="GST NUMBER" />
                      </div>
                      
                      <div className="date-dropdown-group">
                        <label>DATE OF BIRTH</label>
                        <div className="date-dropdowns">
                          <select><option>Day</option><option>01</option><option>02</option></select>
                          <select><option>Month</option><option>Jan</option><option>Feb</option></select>
                          <select><option>Year</option><option>2000</option><option>1999</option></select>
                        </div>
                      </div>

                      <div className="date-dropdown-group">
                        <label>DATE OF ANNIVERSARY</label>
                        <div className="date-dropdowns">
                          <select><option>Day</option><option>01</option><option>02</option></select>
                          <select><option>Month</option><option>Jan</option><option>Feb</option></select>
                          <select><option>Year</option><option>2000</option><option>1999</option></select>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {authMode === 'login' && (
                <>
                  <div className="input-group">
                    <Mail className="input-icon" size={20} />
                    <input type="email" aria-label="Email Address" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>

                  <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="form-options">
                    <a href="#" className="forgot-password">Forgot Password?</a>
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary auth-submit-btn">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
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
