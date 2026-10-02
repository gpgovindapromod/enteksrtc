import { useState } from 'react';
import { loginUser, registerUser, verifyOtp } from '../services/authService';
import { confirmPhoneOtp, sendPhoneOtp } from '../services/firebaseAuth';

export const useAuthForm = (onLoginSuccess, onClose, recaptchaContainerId) => {
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
    firebaseIdToken: '',
    gender: 'Male',
    password: '',
    confirmPassword: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handleSendOtp = async () => {
    if (!signupForm.phone) {
      setAuthError('Please enter your mobile number first.');
      return;
    }
    setAuthError('');
    setSendingOtp(true);
    try {
      const response = await sendPhoneOtp(signupForm.phone, recaptchaContainerId);
      setSignupForm((prev) => ({ ...prev, phone: response.phone }));
      setConfirmationResult(response.confirmationResult);
      setOtpSent(true);
    } catch (error) {
      setAuthError(error.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!signupForm.otp) {
      setAuthError('Please enter the OTP first.');
      return;
    }
    setAuthError('');
    setVerifyingOtp(true);
    try {
      const idToken = await confirmPhoneOtp(confirmationResult, signupForm.otp);
      await verifyOtp(idToken);
      setSignupForm((prev) => ({ ...prev, firebaseIdToken: idToken }));
      setOtpVerified(true);
      setAuthError('');
    } catch (error) {
      setAuthError(error.message || 'Invalid or expired OTP');
      setOtpVerified(false);
    } finally {
      setVerifyingOtp(false);
    }
  };

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
        if (!otpVerified) {
          setAuthError('Please verify your OTP first.');
          setIsSubmitting(false);
          return;
        }

        if (signupForm.password !== signupForm.confirmPassword) {
          setAuthError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }

        const result = await registerUser({
          fullName: signupForm.fullName,
          age: signupForm.age ? Number(signupForm.age) : undefined,
          email: signupForm.email,
          phone: signupForm.phone,
          firebaseIdToken: signupForm.firebaseIdToken,
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

  return {
    authMode,
    setAuthMode,
    showPassword,
    setShowPassword,
    signupTab,
    setSignupTab,
    isSubmitting,
    authError,
    setAuthError,
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
  };
};
