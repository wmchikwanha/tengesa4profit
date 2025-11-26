import { useState, useEffect } from 'react';

interface DataUsageStats {
  firstInstallDate: string | null;
  totalVisits: number;
  cachedVisits: number;
  estimatedDataSaved: number; // in KB
  lastVisitDate: string;
}

const AVERAGE_PAGE_SIZE = 500; // KB - average size of full page load
const STORAGE_KEY = 'pwa-data-usage-stats';

export const useDataUsageTracker = () => {
  const [stats, setStats] = useState<DataUsageStats>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      firstInstallDate: null,
      totalVisits: 0,
      cachedVisits: 0,
      estimatedDataSaved: 0,
      lastVisitDate: new Date().toISOString(),
    };
  });

  useEffect(() => {
    const updateStats = async () => {
      const registration = await navigator.serviceWorker?.getRegistration();
      const isInstalled = !!registration?.active;
      
      const now = new Date().toISOString();
      const today = now.split('T')[0];
      const lastVisitDay = stats.lastVisitDate?.split('T')[0];
      
      // Only count as new visit if it's a different day
      const isNewVisit = today !== lastVisitDay;
      
      if (!isNewVisit) return;

      setStats(prev => {
        const newStats = {
          firstInstallDate: prev.firstInstallDate || (isInstalled ? now : null),
          totalVisits: prev.totalVisits + 1,
          cachedVisits: isInstalled ? prev.cachedVisits + 1 : prev.cachedVisits,
          estimatedDataSaved: isInstalled 
            ? prev.estimatedDataSaved + AVERAGE_PAGE_SIZE
            : prev.estimatedDataSaved,
          lastVisitDate: now,
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
        return newStats;
      });
    };

    updateStats();
  }, []);

  const formatDataSize = (kb: number): string => {
    if (kb < 1024) {
      return `${kb.toFixed(0)} KB`;
    }
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const getDaysSinceInstall = (): number => {
    if (!stats.firstInstallDate) return 0;
    const installDate = new Date(stats.firstInstallDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - installDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return {
    stats,
    formatDataSize,
    getDaysSinceInstall,
    isPWAInstalled: !!stats.firstInstallDate,
  };
};
