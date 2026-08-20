import React from 'react';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuthForm } from '../../hooks/useAuthForm';

const MobileLoginModal = ({ showLoginModal, setShowLoginModal, onLoginSuccess }) => {
  const {
    authMode,
    setAuthMode,
    showPassword,
    setShowPassword,
    signupTab,
    setSignupTab,
    isSubmitting,
    authError,
    loginForm,
    setLoginForm,
    signupForm,
    setSignupForm,
    otpSent,
    sendingOtp,
    otpVerified,
    verifyingOtp,
    handleSendOtp,
    handleVerifyOtp,
    handleSubmit
  } = useAuthForm(onLoginSuccess, () => setShowLoginModal(false));

  if (!showLoginModal) return null;

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

                      <div className="input-group" style={{ display: 'flex', gap: '8px', background: 'transparent', padding: 0, alignItems: 'center' }}>
                        <input
                          type="tel"
                          aria-label="Mobile Number"
                          placeholder="MOBILE NUMBER"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, phone: e.target.value }))}
                          required
                          style={{ flex: 1 }}
                          disabled={otpVerified}
                        />
                        {!otpVerified && (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '0 16px', fontSize: '12px', flex: 'none', background: otpSent ? 'var(--gray)' : 'var(--primary)', color: 'var(--white)', height: '48px', borderRadius: '12px' }}
                            onClick={handleSendOtp}
                            disabled={sendingOtp || (otpSent && !authError)}
                          >
                            {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                          </button>
                        )}
                        {otpVerified && (
                           <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', padding: '0 8px' }}>
                             <CheckCircle size={20} />
                           </div>
                        )}
                      </div>

                      {otpSent && !otpVerified && (
                        <div className="input-group fade-in" style={{ display: 'flex', gap: '8px', background: 'transparent', padding: 0 }}>
                          <input
                            type="text"
                            aria-label="OTP"
                            placeholder="ENTER 6-DIGIT OTP"
                            value={signupForm.otp}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, otp: e.target.value }))}
                            required
                            style={{ flex: 1 }}
                          />
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '0 16px', fontSize: '12px', flex: 'none', background: 'var(--primary)', color: 'var(--white)', height: '48px', borderRadius: '12px' }}
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp}
                          >
                            {verifyingOtp ? 'Verifying...' : 'Verify'}
                          </button>
                        </div>
                      )}

                      {otpVerified && (
                        <div className="input-group fade-in">
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
                      )}
                      
                      {otpVerified && (
                        <div className="input-group fade-in">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            aria-label="Confirm Password"
                            placeholder="Confirm Password"
                            value={signupForm.confirmPassword}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
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

