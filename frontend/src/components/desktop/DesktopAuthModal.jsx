import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const DesktopAuthModal = ({ show, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [signupTab, setSignupTab] = useState('mandatory'); // 'mandatory' | 'optional'
  
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="desktop-auth-overlay" onClick={onClose}>
      <div className="desktop-auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className={`auth-modal-content ${authMode}`}>
          {/* Left Side: Image/Branding */}
          <div className="auth-banner">
            <div className="banner-overlay"></div>
            <div className="banner-content">
              <h2>Ente KSRTC</h2>
              <p>Your premium journey begins here.</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{authMode === 'login' ? 'Please sign in to your account' : 'Join us for a seamless travel experience'}</p>
            </div>

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

            <form onSubmit={handleSubmit} className="modern-auth-form">
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
                        <input type="text" placeholder="NAME" required />
                      </div>
                      <div className="input-group">
                        <input type="number" placeholder="Age" required />
                      </div>
                      <div className="input-group">
                        <input type="email" placeholder="EMAIL ID" required />
                      </div>
                      <div className="input-group">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" required />
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
                        <input type="text" placeholder="GST COMPANY" />
                      </div>
                      <div className="input-group">
                        <input type="text" placeholder="GST NUMBER" />
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
                    <input type="email" placeholder="Email Address" required />
                  </div>

                  <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
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
                    <label className="remember-me">
                      <input type="checkbox" /> Remember me
                    </label>
                    <a href="#" className="forgot-password">Forgot Password?</a>
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary auth-submit-btn">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <div className="auth-divider">
                <span>or continue with</span>
              </div>

              <div className="social-auth">
                <button type="button" className="btn-social google">
                  <img src="/assets/images/google_icon.svg" alt="Google" width="18" />
                  Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopAuthModal;
