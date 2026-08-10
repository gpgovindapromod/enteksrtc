import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isUserLoggedIn: false,
  showLoginModal: false,
  
  setIsUserLoggedIn: (status) => set({ isUserLoggedIn: status }),
  setShowLoginModal: (status) => set({ showLoginModal: status }),
  
  login: () => set({ isUserLoggedIn: true, showLoginModal: false }),
  logout: () => set({ isUserLoggedIn: false }),
}));
