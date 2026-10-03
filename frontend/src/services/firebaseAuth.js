import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

let firebaseApp;
let auth;

if (hasFirebaseConfig) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
} else {
  console.warn("Firebase config is missing from .env. Firebase Auth is mocked.");
  auth = null;
}
let recaptchaVerifier;

const cleanPhone = (phone) => {
  const value = String(phone || '').trim().replace(/[\s()-]/g, '');

  if (/^\d{10}$/.test(value)) {
    return `+91${value}`;
  }

  if (/^\+\d{8,15}$/.test(value)) {
    return value;
  }

  throw new Error('Enter a valid mobile number with country code.');
};

const getPhoneAuthError = (error) => {
  switch (error?.code) {
    case 'auth/operation-not-allowed':
      return new Error(
        'Firebase Phone Authentication is disabled. Enable Phone sign-in in Firebase Console for project enteksrtc-a3a9a.'
      );
    case 'auth/invalid-api-key':
    case 'auth/app-not-authorized':
      return new Error('Firebase is configured for the wrong project or API key.');
    case 'auth/unauthorized-domain':
      return new Error(
        `This domain is not authorized in Firebase Authentication. Add ${window.location.hostname} in Firebase Console.`
      );
    case 'auth/invalid-phone-number':
      return new Error('Enter a valid phone number, including the country code.');
    case 'auth/too-many-requests':
      return new Error('Too many OTP requests. Please wait and try again.');
    default:
      return error;
  }
};

export const sendPhoneOtp = async (phone, recaptchaContainerId) => {
  const normalizedPhone = cleanPhone(phone);

  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
    size: 'invisible',
  });

  if (!hasFirebaseConfig || !auth) {
    console.warn("Mocking sendPhoneOtp due to missing Firebase config");
    return { confirmationResult: { mock: true }, phone: normalizedPhone };
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, normalizedPhone, recaptchaVerifier);
    return { confirmationResult, phone: normalizedPhone };
  } catch (error) {
    recaptchaVerifier.clear();
    recaptchaVerifier = undefined;
    throw getPhoneAuthError(error);
  }
};

export const confirmPhoneOtp = async (confirmationResult, otp) => {
  if (!confirmationResult) {
    throw new Error('Request an OTP before verifying it.');
  }

  if (!hasFirebaseConfig || !auth) {
    console.warn("Mocking confirmPhoneOtp due to missing Firebase config");
    // Return a mock token string if using dev environment without real keys
    return "mock_firebase_id_token";
  }

  try {
    const credential = await confirmationResult.confirm(String(otp).trim());
    return credential.user.getIdToken();
  } catch (error) {
    throw getPhoneAuthError(error);
  }
};
