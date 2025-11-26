import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user previously dismissed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 p-4 shadow-lg bg-primary text-primary-foreground">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-primary-foreground/70 hover:text-primary-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <Download className="h-6 w-6 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Install Tengesa4Profit</h3>
          <p className="text-sm text-primary-foreground/90 mb-3">
            Install our app for offline access and zero data usage on return visits!
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleInstall}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              Install
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
