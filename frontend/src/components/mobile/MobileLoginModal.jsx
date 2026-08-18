import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser, sendOtp } from '../../services/authService';

const MobileLoginModal = ({ showLoginModal, setShowLoginModal, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [signupTab, setSignupTab] = useState('mandatory');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    age: '',
    email: '',
    phone: '',
    otp: '',
    gender: 'Male',
    password: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!signupForm.phone) {
      setAuthError('Please enter your mobile number first.');
      return;
    }
    setAuthError('');
    setSendingOtp(true);
    try {
      await sendOtp(signupForm.phone);
      setOtpSent(true);
    } catch (error) {
      setAuthError(error.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  if (!showLoginModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const result = await loginUser({
          email: loginForm.email,
          password: loginForm.password,
        });
        onLoginSuccess?.(result.user, result.token);
      } else {
        const result = await registerUser({
          fullName: signupForm.fullName,
          age: signupForm.age ? Number(signupForm.age) : undefined,
          email: signupForm.email,
          phone: signupForm.phone,
          otp: signupForm.otp,
          gender: signupForm.gender,
          password: signupForm.password,
        });
        onLoginSuccess?.(result.user, result.token);
      }

      setShowLoginModal(false);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
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
              <button className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>
                Sign In
              </button>
              <button className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`} onClick={() => setAuthMode('signup')}>
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
                        <input
                          type="text"
                          aria-label="Name"
                          placeholder="NAME"
                          value={signupForm.fullName}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, fullName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <input
                          type="number"
                          aria-label="Age"
                          placeholder="Age"
                          value={signupForm.age}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, age: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <input
                          type="email"
                          aria-label="Email ID"
                          placeholder="EMAIL ID"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          aria-label="Password"
                          placeholder="Password"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <div className="input-group" style={{ display: 'flex', gap: '8px', background: 'transparent', padding: 0 }}>
                        <input
                          type="tel"
                          aria-label="Mobile Number"
                          placeholder="MOBILE NUMBER"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, phone: e.target.value }))}
                          required
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ padding: '0 16px', fontSize: '12px', flex: 'none', background: otpSent ? '#334155' : '#10b981', height: '48px', borderRadius: '12px' }}
                          onClick={handleSendOtp}
                          disabled={sendingOtp || otpSent}
                        >
                          {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                        </button>
                      </div>

                      {otpSent && (
                        <div className="input-group fade-in">
                          <input
                            type="text"
                            aria-label="OTP"
                            placeholder="ENTER 6-DIGIT OTP"
                            value={signupForm.otp}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, otp: e.target.value }))}
                            required
                          />
                        </div>
                      )}
                      <div className="input-group select-group">
                        <label className="floating-label">GENDER</label>
                        <select
                          required
                          value={signupForm.gender}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, gender: e.target.value }))}
                        >
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
                          <select>
                            <option>Day</option>
                            <option>01</option>
                            <option>02</option>
                          </select>
                          <select>
                            <option>Month</option>
                            <option>Jan</option>
                            <option>Feb</option>
                          </select>
                          <select>
                            <option>Year</option>
                            <option>2000</option>
                            <option>1999</option>
                          </select>
                        </div>
                      </div>

                      <div className="date-dropdown-group">
                        <label>DATE OF ANNIVERSARY</label>
                        <div className="date-dropdowns">
                          <select>
                            <option>Day</option>
                            <option>01</option>
                            <option>02</option>
                          </select>
                          <select>
                            <option>Month</option>
                            <option>Jan</option>
                            <option>Feb</option>
                          </select>
                          <select>
                            <option>Year</option>
                            <option>2000</option>
                            <option>1999</option>
                          </select>
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
                    <input
                      type="email"
                      aria-label="Email Address"
                      placeholder="Email Address"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="form-options">
                    <a href="#" className="forgot-password">
                      Forgot Password?
                    </a>
                  </div>
                </>
              )}

              {authError && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>
                  {authError}
                </p>
              )}

              <button type="submit" className="btn-primary auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="auth-footer-text">
              {authMode === 'login' ? (
                <>
                  Don&apos;t have an account? <span onClick={() => setAuthMode('signup')}>Sign Up</span>
                </>
              ) : (
                <>
                  Already have an account? <span onClick={() => setAuthMode('login')}>Sign In</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginModal;

