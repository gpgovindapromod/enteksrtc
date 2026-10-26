import React, { useState } from 'react';
import { X, Bus, ArrowRight, Eye, EyeOff, CheckCircle, ShieldCheck, Sparkles, MapPin, Ticket } from 'lucide-react';
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
    fieldErrors,
    validateLoginField,
    validateSignupField,
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
  } = useAuthForm(onLoginSuccess, onClose, 'desktop-recaptcha-container');

  if (!show) return null;

  const isSignup = authMode === 'signup';

  return (
    <div className="auth-stage-overlay" onClick={onClose}>
      <div
        className={`auth-card-stage ${isSignup ? 'mode-signup' : 'mode-signin'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="auth-stage-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* CONTAINER FOR SLIDING FORMS AND HERO PANEL */}
        <div className="auth-slider-container">

          {/* ===================== SIGN IN FORM CONTAINER ===================== */}
          <div className="auth-form-side sign-in-side">
            <div className="auth-form-scroll-wrapper">
              <div className="auth-form-content">
                <div className="brand-badge">
                  <Bus size={18} className="text-emerald-500 animate-pulse" />
                  <span>Ente KSRTC Premium</span>
                </div>

                <div className="auth-title-block">
                  <h2 className="auth-main-title">Welcome Back</h2>
                  <p className="auth-sub-title">Sign in to manage your bookings and live tracking</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="auth-interactive-form">
                  <div className="auth-field-group">
                    <label className="auth-label">Email Address</label>
                    <div className="auth-input-wrapper">
                      <input
                        type="email"
                        className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
                        placeholder="passenger@enteksrtc.com"
                        value={loginForm.email}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          setLoginForm((prev) => ({ ...prev, email: e.target.value }));
                          if (fieldErrors.email) validateLoginField('email', e.target.value);
                        }}
                        onBlur={(e) => validateLoginField('email', e.target.value)}
                        required
                      />
                    </div>
                    {fieldErrors.email && (
                      <span className="auth-field-error">{fieldErrors.email}</span>
                    )}
                  </div>

                  <div className="auth-field-group">
                    <div className="flex justify-between items-center mb-1">
                      <label className="auth-label">Password</label>
                      <a href="#" className="auth-link-forgot" onClick={(e) => e.preventDefault()}>
                        Forgot password?
                      </a>
                    </div>
                    <div className="auth-input-wrapper password-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                        placeholder="••••••••"
                        value={loginForm.password}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          setLoginForm((prev) => ({ ...prev, password: e.target.value }));
                          if (fieldErrors.password) validateLoginField('password', e.target.value);
                        }}
                        onBlur={(e) => validateLoginField('password', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle-btn"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <span className="auth-field-error">{fieldErrors.password}</span>
                    )}
                  </div>

                  {authError && authMode === 'login' && (
                    <div className="auth-alert-box error">
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="auth-btn-primary"
                    disabled={isSubmitting}
                  >
                    <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                    <ArrowRight size={18} />
                  </button>

                  <div className="auth-switch-mobile-prompt">
                    <span>Don't have an account?</span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="auth-switch-text-btn"
                    >
                      Sign Up
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* ===================== SIGN UP FORM CONTAINER ===================== */}
          <div className="auth-form-side sign-up-side">
            <div className="auth-form-scroll-wrapper">
              <div className="auth-form-content">
                <div className="brand-badge">
                  <Sparkles size={16} className="text-emerald-500" />
                  <span>Create Account</span>
                </div>

                <div className="auth-title-block">
                  <h2 className="auth-main-title">Join Ente KSRTC</h2>
                  <p className="auth-sub-title">Register for instant ticketing and priority bookings</p>
                </div>

                <div className="signup-tabs-pill">
                  <button
                    type="button"
                    className={`signup-pill-btn ${signupTab === 'mandatory' ? 'active' : ''}`}
                    onClick={() => setSignupTab('mandatory')}
                  >
                    Required Info
                  </button>
                  <button
                    type="button"
                    className={`signup-pill-btn ${signupTab === 'optional' ? 'active' : ''}`}
                    onClick={() => setSignupTab('optional')}
                  >
                    Optional Info
                  </button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="auth-interactive-form">
                  <div id="desktop-recaptcha-container" />

                  {signupTab === 'mandatory' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 auth-field-group">
                          <label className="auth-label">Full Name</label>
                          <input
                            type="text"
                            className="auth-input"
                            placeholder="Enter Your Name"
                            value={signupForm.fullName}
                            onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, fullName: e.target.value }));
                              if (fieldErrors.signup_fullName) validateSignupField('fullName', e.target.value, signupForm);
                            }}
                            onBlur={(e) => validateSignupField('fullName', e.target.value, signupForm)}
                            required
                          />
                          {fieldErrors.signup_fullName && (
                            <span className="auth-field-error">{fieldErrors.signup_fullName}</span>
                          )}
                        </div>

                        <div className="auth-field-group">
                          <label className="auth-label">Age</label>
                          <input
                            type="number"
                            className="auth-input"
                            placeholder="Age"
                            value={signupForm.age}
                            onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, age: e.target.value }));
                              if (fieldErrors.signup_age) validateSignupField('age', e.target.value, signupForm);
                            }}
                            onBlur={(e) => validateSignupField('age', e.target.value, signupForm)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 auth-field-group">
                          <label className="auth-label">Email Address</label>
                          <input
                            type="email"
                            className="auth-input"
                            placeholder="name@domain.com"
                            value={signupForm.email}
                            onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, email: e.target.value }));
                              if (fieldErrors.signup_email) validateSignupField('email', e.target.value, signupForm);
                            }}
                            onBlur={(e) => validateSignupField('email', e.target.value, signupForm)}
                            required
                          />
                          {fieldErrors.signup_email && (
                            <span className="auth-field-error">{fieldErrors.signup_email}</span>
                          )}
                        </div>

                        <div className="auth-field-group">
                          <label className="auth-label">Gender</label>
                          <select
                            className="auth-input bg-transparent"
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

                      <div className="auth-field-group">
                        <label className="auth-label">Mobile Number (Phone OTP)</label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            className="auth-input flex-1"
                            placeholder="+91 98765 43210"
                            value={signupForm.phone}
                            onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, phone: e.target.value }));
                              if (fieldErrors.signup_phone) validateSignupField('phone', e.target.value, signupForm);
                            }}
                            onBlur={(e) => validateSignupField('phone', e.target.value, signupForm)}
                            disabled={otpSent || otpVerified}
                            required
                          />
                          {!otpVerified && (
                            <button
                              type="button"
                              className="auth-btn-action"
                              onClick={handleSendOtp}
                              disabled={sendingOtp || !signupForm.phone || otpSent}
                            >
                              {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                            </button>
                          )}
                          {otpVerified && (
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs px-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl">
                              <CheckCircle size={16} /> Verified
                            </div>
                          )}
                        </div>
                      </div>

                      {otpSent && !otpVerified && (
                        <div className="auth-field-group animate-fade-in-up">
                          <label className="auth-label">Enter 6-digit OTP</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              className="auth-input flex-1"
                              placeholder="123456"
                              value={signupForm.otp}
                              onChange={(e) => {
                                setSignupForm((prev) => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }));
                              }}
                              required
                            />
                            <button
                              type="button"
                              className="auth-btn-action"
                              onClick={handleVerifyOtp}
                              disabled={verifyingOtp || signupForm.otp.length !== 6}
                            >
                              {verifyingOtp ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                        </div>
                      )}

                      {otpVerified && (
                        <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
                          <div className="auth-field-group">
                            <label className="auth-label">Create Password</label>
                            <div className="auth-input-wrapper password-wrapper">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                className="auth-input"
                                placeholder="••••••••"
                                value={signupForm.password}
                                onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle-btn"
                                aria-label="Toggle password visibility"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                          <div className="auth-field-group">
                            <label className="auth-label">Confirm Password</label>
                            <div className="auth-input-wrapper password-wrapper">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                className="auth-input"
                                placeholder="••••••••"
                                value={signupForm.confirmPassword}
                                onChange={(e) => setSignupForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle-btn"
                                aria-label="Toggle password visibility"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="auth-field-group">
                          <label className="auth-label">GST Company (Optional)</label>
                          <input type="text" className="auth-input" placeholder="Company Name" />
                        </div>
                        <div className="auth-field-group">
                          <label className="auth-label">GST Number (Optional)</label>
                          <input type="text" className="auth-input" placeholder="32AAAAA0000A1Z5" />
                        </div>
                      </div>

                      <div className="auth-field-group">
                        <label className="auth-label">Date of Birth</label>
                        <input type="date" className="auth-input" />
                      </div>
                    </div>
                  )}

                  {authError && authMode === 'signup' && (
                    <div className="auth-alert-box error mt-2">
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="auth-btn-primary mt-4"
                    disabled={isSubmitting || (signupTab === 'mandatory' && !otpVerified)}
                  >
                    <span>{isSubmitting ? 'Registering...' : 'Create Account'}</span>
                    <ArrowRight size={18} />
                  </button>

                  <div className="auth-switch-mobile-prompt">
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="auth-switch-text-btn"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* ===================== THE SLIDING HERO PANEL ===================== */}
          <div className="auth-hero-slider-panel">
            <div className="auth-hero-backdrop">
              <img
                src="/assets/images/premium_hero_1.webp"
                alt="Kerala Scenic Bus Travel"
                className="auth-hero-img"
              />
              <div className="auth-hero-overlay"></div>
            </div>

            {/* Content for Sign In (When on the right side) */}
            <div className="hero-content-view hero-for-signin">
              <div className="hero-icon-bubble">
                <Ticket size={28} className="text-emerald-400" />
              </div>
              <h3 className="hero-headline">Seamless Travel Across God's Own Country</h3>
              <p className="hero-description">
                Experience comfort, verified seat bookings, live bus telemetry, and instant refunds with Kerala's premier transit network.
              </p>

              <div className="hero-perks-list">
                <div className="hero-perk-item">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                  <span>100% Verified Secure Check-in</span>
                </div>
                <div className="hero-perk-item">
                  <MapPin size={18} className="text-emerald-400 shrink-0" />
                  <span>Over 2,400+ Daily Routes Connected</span>
                </div>
              </div>

              <div className="hero-switch-card">
                <span>New to Ente KSRTC?</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="hero-switch-btn"
                >
                  Create Account
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Content for Sign Up (When on the left side) */}
            <div className="hero-content-view hero-for-signup">
              <div className="hero-icon-bubble">
                <Bus size={28} className="text-emerald-400" />
              </div>
              <h3 className="hero-headline">Your Gateway to Kerala's Scenic Routes</h3>
              <p className="hero-description">
                Already registered? Sign back in to access your saved boarding passes, journey history, and station updates.
              </p>

              <div className="hero-perks-list">
                <div className="hero-perk-item">
                  <Sparkles size={18} className="text-emerald-400 shrink-0" />
                  <span>Exclusive Express & K-Swift Services</span>
                </div>
                <div className="hero-perk-item">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                  <span>Instant Cancellation & Automated Refunds</span>
                </div>
              </div>

              <div className="hero-switch-card">
                <span>Have an existing account?</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="hero-switch-btn"
                >
                  Sign In
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DesktopAuthModal;
