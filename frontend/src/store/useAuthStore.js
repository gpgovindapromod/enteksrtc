import { create } from 'zustand';

const AUTH_STORAGE_KEY = 'enteksrtc_auth';

const getInitialAuthState = () => {
  if (typeof window === 'undefined') {
    return { isUserLoggedIn: false, token: null, user: null };
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return { isUserLoggedIn: false, token: null, user: null };
    }

    const parsed = JSON.parse(raw);
    return {
      isUserLoggedIn: Boolean(parsed?.token),
      token: parsed?.token || null,
      user: parsed?.user || null,
    };
  } catch {
    return { isUserLoggedIn: false, token: null, user: null };
  }
};

const persistAuthState = (state) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token: state.token || null,
      user: state.user || null,
    }),
  );
};

const clearPersistedAuthState = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const initialAuthState = getInitialAuthState();

export const useAuthStore = create((set) => ({
  ...initialAuthState,
  showLoginModal: false,

  setIsUserLoggedIn: (status) =>
    set((state) => {
      if (!status) {
        clearPersistedAuthState();
        return { isUserLoggedIn: false, token: null, user: null };
      }

      const nextState = { isUserLoggedIn: true, token: state.token, user: state.user };
      persistAuthState(nextState);
      return nextState;
    }),
  setShowLoginModal: (status) => set({ showLoginModal: status }),

  setAuthSession: ({ token, user }) =>
    set((state) => {
      const nextState = {
        isUserLoggedIn: Boolean(token || state.token),
        token: token || state.token || null,
        user: user || state.user || null,
        showLoginModal: false,
      };
      persistAuthState(nextState);
      return nextState;
    }),
  clearAuthSession: () =>
    set(() => {
      clearPersistedAuthState();
      return { isUserLoggedIn: false, token: null, user: null };
    }),

  login: ({ token, user }) =>
    set(() => {
      const nextState = { isUserLoggedIn: true, token: token || null, user: user || null, showLoginModal: false };
      persistAuthState(nextState);
      return nextState;
    }),
  logout: () =>
    set(() => {
      clearPersistedAuthState();
      return { isUserLoggedIn: false, token: null, user: null };
    }),
}));
