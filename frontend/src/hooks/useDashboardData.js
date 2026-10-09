import { useState, useEffect } from 'react';
import { getDashboardData } from '../services/dashboardService';

export const useDashboardData = (filters = {}) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // We convert filters to a string to use as a dependency, so we don't trigger
  // infinite loops if the parent passes a new object reference every render
  const filterString = JSON.stringify(filters);

  useEffect(() => {
    setLoading(true);
    // Let's keep the old data while fetching to avoid layout shift on filter changes
    // But for a hard refresh, you might want to set to null.

    getDashboardData(JSON.parse(filterString))
      .then((res) => {
        if (res?.success) {
          setDashboardData(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterString]);

  return { dashboardData, loading };
};
