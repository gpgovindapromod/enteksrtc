import React from 'react';
import { X, Bus, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuthForm } from '../../hooks/useAuthForm';
import './DesktopAuthModal.css';

const DesktopAuthModal = ({ show, onClose, onLoginSuccess }) => {
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
  } = useAuthForm(onLoginSuccess, onClose);

  if (!show) return null;

  return (
    <div className="boarding-pass-overlay" onClick={onClose}>
      <div className="boarding-pass-wrapper animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <button className="bp-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="bp-main">
          <div className="bp-airline">
            <Bus size={18} /> ENTE KSRTC PREMIUM
          </div>
          <h2 className="bp-title">
            {authMode === 'login' ? 'Passenger Check-In' : 'New Passenger Registration'}
          </h2>

          <div className="bp-tabs">
            <button className={`bp-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>
              Sign In
            </button>
            <button className={`bp-tab ${authMode === 'signup' ? 'active' : ''}`} onClick={() => setAuthMode('signup')}>
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bp-form">
            {authMode === 'signup' && (
              <>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <button
                    type="button"
                    className="bp-subtab"
                    onClick={() => setSignupTab('mandatory')}
                    style={{ 
                      paddingBottom: '4px', 
                      fontSize: '12px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      fontWeight: signupTab === 'mandatory' ? 'bold' : 'normal',
                      color: signupTab === 'mandatory' ? 'var(--primary)' : 'var(--gray)',
                      borderBottom: signupTab === 'mandatory' ? '2px solid var(--primary)' : '2px solid transparent',
                      background: 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Mandatory Info
                  </button>
                  <button
                    type="button"
                    className="bp-subtab"
                    onClick={() => setSignupTab('optional')}
                    style={{ 
                      paddingBottom: '4px', 
                      fontSize: '12px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      fontWeight: signupTab === 'optional' ? 'bold' : 'normal',
                      color: signupTab === 'optional' ? 'var(--primary)' : 'var(--gray)',
                      borderBottom: signupTab === 'optional' ? '2px solid var(--primary)' : '2px solid transparent',
                      background: 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Optional Info
                  </button>
                </div>

                {signupTab === 'mandatory' ? (
                  <div className="fade-in" style={{ overflowY: 'auto', paddingRight: '8px', maxHeight: '320px' }}>
                    <div className="bp-input-row">
                      <div className="bp-input-group">
                        <label className="bp-label">Name</label>
                        <input
                          type="text"
                          className="bp-input"
                          placeholder="NAME"
                          value={signupForm.fullName}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, fullName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="bp-input-group">
                        <label className="bp-label">Age</label>
                        <input
                          type="number"
                          className="bp-input"
                          placeholder="AGE"
                          value={signupForm.age}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, age: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="bp-input-row">
                      <div className="bp-input-group">
                        <label className="bp-label">Email ID</label>
                        <input
                          type="email"
                          className="bp-input"
                          placeholder="EMAIL ID"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="bp-input-group">
                        <label className="bp-label">Gender</label>
                        <select
                          className="bp-input bg-transparent"
                          value={signupForm.gender}
                          onChange={(e) => setSignupForm((prev) => ({ ...prev, gender: e.target.value }))}
                          required
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="bp-input-row">
                      <div className="bp-input-group" style={{ flex: 1 }}>
                        <label className="bp-label">Mobile Number</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="tel"
                            className="bp-input"
                            placeholder="MOBILE NUMBER"
                            value={signupForm.phone}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, phone: e.target.value }))}
                            required
                            disabled={otpVerified}
                          />
                          {!otpVerified && (
                            <button
                              type="button"
                              className="bp-button"
                              style={{ padding: '8px 12px', fontSize: '12px', flex: 'none', background: otpSent ? 'var(--gray)' : 'var(--primary)', color: 'var(--white)' }}
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
                      </div>
                    </div>

                    {otpSent && !otpVerified && (
                      <div className="bp-input-row fade-in">
                        <div className="bp-input-group">
                          <label className="bp-label">OTP Verification</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              className="bp-input"
                              placeholder="ENTER 6-DIGIT OTP"
                              value={signupForm.otp}
                              onChange={(e) => setSignupForm((prev) => ({ ...prev, otp: e.target.value }))}
                              required
                            />
                            <button
                              type="button"
                              className="bp-button"
                              style={{ padding: '8px 12px', fontSize: '12px', flex: 'none', background: 'var(--primary)', color: 'var(--white)' }}
                              onClick={handleVerifyOtp}
                              disabled={verifyingOtp}
                            >
                              {verifyingOtp ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {otpVerified && (
                      <div className="bp-input-row fade-in">
                        <div className="bp-input-group" style={{ position: 'relative' }}>
                          <label className="bp-label">Password</label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="bp-input"
                            placeholder="PASSWORD"
                            value={signupForm.password}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '0', bottom: '12px', color: '#94a3b8', background: 'none', border: 'none' }}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <div className="bp-input-group" style={{ position: 'relative' }}>
                          <label className="bp-label">Confirm Password</label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="bp-input"
                            placeholder="CONFIRM PASSWORD"
                            value={signupForm.confirmPassword}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="fade-in" style={{ overflowY: 'auto', paddingRight: '8px', maxHeight: '320px' }}>
                    <div className="bp-input-row">
                      <div className="bp-input-group">
                        <label className="bp-label">GST Company</label>
                        <input type="text" className="bp-input" placeholder="GST COMPANY" />
                      </div>
                      <div className="bp-input-group">
                        <label className="bp-label">GST Number</label>
                        <input type="text" className="bp-input" placeholder="GST NUMBER" />
                      </div>
                    </div>

                    <div className="bp-input-row" style={{ marginBottom: '16px' }}>
                      <div className="bp-input-group">
                        <label className="bp-label">Date of Birth</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select className="bp-input bg-transparent" style={{ padding: '4px 0' }}>
                            <option>Day</option>
                            <option>01</option>
                            <option>02</option>
                          </select>
                          <select className="bp-input bg-transparent" style={{ padding: '4px 0' }}>
                            <option>Month</option>
                            <option>Jan</option>
                            <option>Feb</option>
                          </select>
                          <select className="bp-input bg-transparent" style={{ padding: '4px 0' }}>
                            <option>Year</option>
                            <option>2000</option>
                            <option>1999</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bp-input-row">
                      <div className="bp-input-group">
                        <label className="bp-label">Date of Anniversary</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select className="bp-input bg-transparent" style={{ padding: '4px 0' }}>
                            <option>Day</option>
                            <option>01</option>
                            <option>02</option>
                          </select>
                          <select className="bp-input bg-transparent" style={{ padding: '4px 0' }}>
                            <option>Month</option>
                            <option>Jan</option>
                            <option>Feb</option>
                          </select>
                          <select className="bp-input bg-transparent" style={{ padding: '4px 0' }}>
                            <option>Year</option>
                            <option>2000</option>
                            <option>1999</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {authMode === 'login' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="bp-input-row">
                  <div className="bp-input-group">
                    <label className="bp-label">Email Address</label>
                    <input
                      type="email"
                      className="bp-input"
                      placeholder="Email Address"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="bp-input-row" style={{ marginBottom: '16px' }}>
                  <div className="bp-input-group" style={{ position: 'relative' }}>
                    <label className="bp-label">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="bp-input"
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '0', bottom: '12px', color: '#94a3b8', background: 'none', border: 'none' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', cursor: 'pointer' }}>
                    <input type="checkbox" aria-label="Remember me" style={{ accentColor: '#10b981' }} /> Remember me
                  </label>
                  <a href="#" style={{ color: '#10b981', textDecoration: 'none' }}>
                    Forgot Password?
                  </a>
                </div>
              </div>
            )}

            {authError && (
              <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>
                {authError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
              <button type="submit" className="bp-button" style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}{' '}
                {!isSubmitting && <ArrowRight size={18} className="inline ml-2" />}
              </button>

              {authMode === 'login' && (
                <button
                  type="button"
                  className="bp-button"
                  style={{ background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <img src="/assets/images/google_icon.svg" alt="Google" width="18" />
                  Google
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="boarding-pass-divider"></div>

        <div className="bp-stub">
          <div className="bp-stub-top">
            <div className="bp-label">Boarding Pass</div>
            <div className="bp-title" style={{ fontSize: '20px' }}>
              FIRST CLASS
            </div>

            <div className="bp-barcode"></div>
            <div className="bp-barcode-text">KSRTC-90210-VIP</div>
          </div>

          <div className="bp-flight-info">
            <div>
              <div className="bp-label">CLASS</div>
              <div className="val text-[#10b981]">VIP</div>
            </div>
            <div>
              <div className="bp-label">GATE</div>
              <div className="val">A1</div>
            </div>
            <div>
              <div className="bp-label">SEAT</div>
              <div className="val">TBD</div>
            </div>
          </div>

          <div>
            <div className="bp-label text-center">Status</div>
            <div className="font-bold text-emerald-500 text-center">
              {authMode === 'login' ? 'AWAITING CHECK-IN' : 'PENDING REGISTRATION'}
            </div>
            <p className="bp-subtext">Present this ticket at the counter for seamless travel.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopAuthModal;

