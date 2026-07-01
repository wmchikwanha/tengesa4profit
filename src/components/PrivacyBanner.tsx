import React, { useState } from 'react';
import { Shield, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const KEY = 'privacy_banner_dismissed_v1';

export const PrivacyBanner: React.FC = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem(KEY) === 'true'
  );

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="mb-4 rounded-lg border border-zimbabwe-green/30 bg-zimbabwe-lightGreen/40 p-3 flex items-center gap-3">
      <Shield className="h-5 w-5 text-zimbabwe-darkGreen shrink-0" />
      <div className="flex-1 text-sm">
        <span className="font-semibold text-zimbabwe-darkGreen">Your data stays private.</span>{' '}
        <span className="text-muted-foreground">You can export or delete everything, anytime.</span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="text-zimbabwe-darkGreen hover:bg-zimbabwe-green/10"
        onClick={() => navigate('/privacy-center')}
      >
        Privacy Center
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
      <Button size="icon" variant="ghost" onClick={dismiss} aria-label="Dismiss">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
