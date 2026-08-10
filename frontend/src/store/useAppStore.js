import { create } from 'zustand';

export const useAppStore = create((set) => ({
  isMobile: false,
  forceMobilePreview: false,
  language: 'en',
  hasActivatedWebApp: false,
  isScrolled: false,
  
  showLiveTracking: false,
  trackingStep: 0,
  showNotifications: false,
  showTimingsModal: false,
  
  expandedTicketId: null,
  faqExpanded: { 0: false, 1: false, 2: false },
  
  setIsMobile: (isMobile) => set({ isMobile }),
  setForceMobilePreview: (forceMobilePreview) => set({ forceMobilePreview }),
  setLanguage: (language) => set({ language }),
  setHasActivatedWebApp: (hasActivatedWebApp) => set({ hasActivatedWebApp }),
  setIsScrolled: (isScrolled) => set({ isScrolled }),
  
  setShowLiveTracking: (showLiveTracking) => set({ showLiveTracking }),
  setTrackingStep: (stepOrFn) => set((state) => ({ 
    trackingStep: typeof stepOrFn === 'function' ? stepOrFn(state.trackingStep) : stepOrFn 
  })),
  setShowNotifications: (showNotifications) => set({ showNotifications }),
  setShowTimingsModal: (showTimingsModal) => set({ showTimingsModal }),
  
  setExpandedTicketId: (expandedTicketId) => set({ expandedTicketId }),
  setFaqExpanded: (faqExpanded) => set({ faqExpanded }),
}));
