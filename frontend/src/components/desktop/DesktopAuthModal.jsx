import React, { useState } from 'react';
import { X, Bus, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser, sendOtp } from '../../services/authService';
import './DesktopAuthModal.css';

const DesktopAuthModal = ({ show, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [signupTab, setSignupTab] = useState('mandatory');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
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

  if (!show) return null;

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

      onClose?.();
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    className={`bp-subtab ${
                      signupTab === 'mandatory'
                        ? 'text-emerald-500 font-bold border-b-2 border-emerald-500'
                        : 'text-slate-400'
                    }`}
                    onClick={() => setSignupTab('mandatory')}
                    style={{ paddingBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    Mandatory Info
                  </button>
                  <button
                    type="button"
                    className={`bp-subtab ${
                      signupTab === 'optional'
                        ? 'text-emerald-500 font-bold border-b-2 border-emerald-500'
                        : 'text-slate-400'
                    }`}
                    onClick={() => setSignupTab('optional')}
                    style={{ paddingBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
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
                          />
                          <button
                            type="button"
                            className="bp-button"
                            style={{ padding: '8px 12px', fontSize: '12px', flex: 'none', background: otpSent ? '#334155' : '#10b981' }}
                            onClick={handleSendOtp}
                            disabled={sendingOtp || otpSent}
                          >
                            {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {otpSent && (
                      <div className="bp-input-row fade-in">
                        <div className="bp-input-group">
                          <label className="bp-label">OTP Verification</label>
                          <input
                            type="text"
                            className="bp-input"
                            placeholder="ENTER 6-DIGIT OTP"
                            value={signupForm.otp}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, otp: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="bp-input-row">
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
                    </div>
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

