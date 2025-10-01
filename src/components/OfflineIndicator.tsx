import React from 'react';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { useLanguage } from '@/contexts/LanguageContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOfflineDetection();
  const { t } = useLanguage();

  if (isOnline) return null;

  return (
    <Alert className="fixed top-4 left-4 right-4 z-50 bg-orange-50 border-orange-300">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        You're offline. Data will sync when connection is restored.
      </AlertDescription>
    </Alert>
  );
};
