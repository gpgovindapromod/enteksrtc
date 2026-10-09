const fs = require('fs');

const file = 'frontend/src/components/mobile/MobileLoginModal.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<a href="#" className="forgot-password">',
  '<a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); setAuthMode(\'forgot_password\'); }}>'
);

const target1 = `              )}

              {authError && (`;

const replacement1 = `              )}

              {authMode === 'forgot_password' && (
                <>
                  <div className="tab-pane fade-in">
                    <h4 style={{ marginBottom: '16px', color: 'var(--text)' }}>Reset Password</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Enter your verified mobile number to receive an OTP and reset your password.
                    </p>

                    {!otpVerified ? (
                      <>
                        <div className="input-group" style={{ display: 'flex', gap: '8px', background: 'transparent', padding: 0, alignItems: 'center', minHeight: '48px' }}>
                          <input
                            type="tel"
                            aria-label="Mobile Number"
                            placeholder="MOBILE NUMBER"
                            value={signupForm.phone}
                            onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, phone: e.target.value }));
                              if (fieldErrors.signup_phone) validateSignupField('phone', e.target.value, signupForm);
                            }}
                            onBlur={(e) => validateSignupField('phone', e.target.value, signupForm)}
                            disabled={otpSent}
                            required
                          />
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSendOtp}
                            disabled={sendingOtp || !signupForm.phone || otpSent}
                            style={{ padding: '0 16px', height: '48px', whiteSpace: 'nowrap', borderRadius: '8px' }}
                          >
                            {sendingOtp ? '...' : otpSent ? 'Sent' : 'Send OTP'}
                          </button>
                        </div>
                        {otpSent && (
                          <div className="input-group fade-in" style={{ display: 'flex', gap: '8px', background: 'transparent', padding: 0, alignItems: 'center', minHeight: '48px', marginTop: '16px' }}>
                            <input
                              type="text"
                              aria-label="OTP"
                              placeholder="ENTER OTP"
                              value={signupForm.otp}
                              onChange={(e) => {
                                setSignupForm((prev) => ({ ...prev, otp: e.target.value }));
                                if (fieldErrors.signup_otp) validateSignupField('otp', e.target.value, signupForm);
                              }}
                              onBlur={(e) => validateSignupField('otp', e.target.value, signupForm)}
                              required
                            />
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={handleVerifyOtp}
                              disabled={verifyingOtp || !signupForm.otp}
                              style={{ padding: '0 16px', height: '48px', whiteSpace: 'nowrap', borderRadius: '8px' }}
                            >
                              {verifyingOtp ? '...' : 'Verify'}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="input-group" style={{ display: 'flex', gap: '8px', background: 'transparent', padding: 0, alignItems: 'center', minHeight: '48px', marginBottom: '16px' }}>
                          <input
                            type="tel"
                            aria-label="Mobile Number"
                            value={signupForm.phone}
                            readOnly
                            disabled
                            style={{ flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--primary)', color: 'var(--text)' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', padding: '0 8px' }}>
                            <CheckCircle size={20} />
                          </div>
                        </div>
                        <div className="input-group fade-in">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            aria-label="New Password"
                            placeholder="New Password"
                            value={signupForm.password}
                            onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, password: e.target.value }));
                              if (fieldErrors.signup_password) validateSignupField('password', e.target.value, signupForm);
                            }}
                            onBlur={(e) => validateSignupField('password', e.target.value, signupForm)}
                            required
                          />
                          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <div className="input-group fade-in">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            aria-label="Confirm New Password"
                            placeholder="Confirm New Password"
                            value={signupForm.confirmPassword}
                            onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                              if (fieldErrors.signup_confirmPassword) validateSignupField('confirmPassword', e.target.value, signupForm);
                            }}
                            onBlur={(e) => validateSignupField('confirmPassword', e.target.value, signupForm)}
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {authError && (`;

content = content.replace(target1, replacement1);
// Try regex to match regardless of newline types
content = content.replace(/{\s*isSubmitting \? 'Please wait\.\.\.' : authMode === 'login' \? 'Sign In' : 'Create Account'\s*}/g, "{isSubmitting ? 'Please wait...' : authMode === 'login' ? 'Sign In' : authMode === 'forgot_password' ? 'Reset Password' : 'Create Account'}");
content = content.replace(/disabled={isSubmitting}/g, "disabled={isSubmitting || (authMode === 'forgot_password' && !otpVerified)}");

fs.writeFileSync(file, content);
