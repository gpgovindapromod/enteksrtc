import { useState } from 'react';
import { loginUser, registerUser, verifyOtp } from '../services/authService';
import { confirmPhoneOtp, sendPhoneOtp } from '../services/firebaseAuth';

export const useAuthForm = (onLoginSuccess, onClose, recaptchaContainerId) => {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [signupTab, setSignupTab] = useState('mandatory');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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
    
    if (signupForm.phone.replace(/[^0-9]/g, '').length < 10) {
      setAuthError('Please enter a valid phone number with at least 10 digits.');
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

  const validateLoginField = (field, value) => {
    let error = '';
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Invalid email address';
    }
    if (field === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Minimum 6 characters';
    }
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const validateSignupField = (field, value, formState = signupForm) => {
    let error = '';
    if (field === 'fullName') {
      if (!value || value.trim().length < 3) error = 'At least 3 characters required';
    }
    if (field === 'age') {
      if (value) {
        const ageNum = Number(value);
        if (isNaN(ageNum) || ageNum < 12 || ageNum > 120) error = 'Must be 12-120 years';
      }
    }
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Invalid email address';
    }
    if (field === 'phone') {
      if (!value || value.replace(/[^0-9]/g, '').length < 10) error = 'Minimum 10 digits required';
    }
    if (field === 'password') {
      if (!value || value.length < 8) error = 'Minimum 8 characters';
      else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) error = 'Must contain letters and numbers';
    }
    if (field === 'confirmPassword') {
      if (value !== formState.password) error = 'Passwords do not match';
    }
    setFieldErrors(prev => ({ ...prev, [`signup_${field}`]: error }));
    return error === '';
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const isEmailValid = validateLoginField('email', loginForm.email);
        const isPasswordValid = validateLoginField('password', loginForm.password);
        if (!isEmailValid || !isPasswordValid) {
          setIsSubmitting(false);
          return;
        }

        const result = await loginUser({
          email: loginForm.email,
          password: loginForm.password,
        });
        onLoginSuccess?.(result.user, result.token);
      } else {
        // --- SIGNUP VALIDATIONS ---
        const isNameValid = validateSignupField('fullName', signupForm.fullName, signupForm);
        const isAgeValid = validateSignupField('age', signupForm.age, signupForm);
        const isEmailValid = validateSignupField('email', signupForm.email, signupForm);
        const isPhoneValid = validateSignupField('phone', signupForm.phone, signupForm);
        const isPasswordValid = validateSignupField('password', signupForm.password, signupForm);
        const isConfirmPasswordValid = validateSignupField('confirmPassword', signupForm.confirmPassword, signupForm);
        
        if (!isNameValid || !isAgeValid || !isEmailValid || !isPhoneValid || !isPasswordValid || !isConfirmPasswordValid) {
          setIsSubmitting(false);
          return;
        }
        
        if (!otpVerified) {
          setAuthError('Please verify your mobile number with OTP before registering.');
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
    fieldErrors,
    setFieldErrors,
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
  };
};
