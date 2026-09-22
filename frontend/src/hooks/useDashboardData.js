import { useState, useEffect } from 'react';
import { getDashboardData } from '../services/dashboardService';

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDashboardData(null); // clear old data when fetching

    getDashboardData()
      .then((res) => {
        if (res?.success) {
          setDashboardData(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { dashboardData, loading };
};
