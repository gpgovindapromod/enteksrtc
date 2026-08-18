import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import { getCurrentUser } from './services/authService';

import DesktopLayout from './components/desktop/DesktopLayout';
import MobileLayout from './components/mobile/MobileLayout';

function App() {
  const { isMobile, setIsMobile, forceMobilePreview } = useAppStore();
  const { setAuthSession, clearAuthSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Screen size resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  // Session restoration
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const result = await getCurrentUser();
        if (!isMounted) return;
        setAuthSession({ user: result.user });
      } catch (error) {
        if (!isMounted) return;
        if (error.statusCode === 401) {
          clearAuthSession();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [setAuthSession, clearAuthSession]);

  if (isLoading) {
    return (
      <div className="splash-screen">
        <div className="loader-container">
          <Bus size={64} className="bus-loader" color="var(--primary)" />
          <div className="loading-text">Loading Ente KSRTC...</div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  const showMobileView = isMobile || forceMobilePreview;

  return (
    <Routes>
      <Route path="*" element={!showMobileView ? <DesktopLayout /> : <MobileLayout />} />
    </Routes>
  );
}

export default App;
