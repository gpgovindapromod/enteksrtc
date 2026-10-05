const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAuthForm.js', 'utf8');

const newHandleSubmit = `  const handleSubmit = async (e) => {
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
  };`;

content = content.replace(/const handleSubmit = async \(e\) => \{[\s\S]*?setIsSubmitting\(false\);\s*\}\s*\};\s*/, newHandleSubmit + '\n\n');
fs.writeFileSync('src/hooks/useAuthForm.js', content);
