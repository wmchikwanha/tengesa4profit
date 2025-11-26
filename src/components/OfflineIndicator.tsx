import React, { useState, useEffect } from 'react';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOfflineDetection();
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && !justReconnected) {
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline && !justReconnected) return null;

  if (justReconnected) {
    return (
      <Alert className="fixed top-4 left-4 right-4 z-50 bg-green-50 border-green-300">
        <Wifi className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Back online! Your data is synced.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="fixed top-4 left-4 right-4 z-50 bg-orange-50 border-orange-300">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <strong>Offline Mode</strong> - App still works! All your data is saved locally and will sync when you reconnect.
      </AlertDescription>
    </Alert>
  );
};
