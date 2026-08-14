import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGuestMode } from '@/contexts/GuestModeContext';
import { ShieldCheck } from 'lucide-react';

export const GuestTrialBanner: React.FC = () => {
  const { guestDaysLeft } = useGuestMode();
  const navigate = useNavigate();

  return (
    <div className="mb-6 rounded-lg border border-zimbabwe-green bg-white/70 p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-zimbabwe-green mt-0.5 shrink-0" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">Guest — no account</Badge>
            <span className="text-sm font-medium">{guestDaysLeft} days left</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            Everything you enter stays on this phone only. Create a free account any time to back it
            up and unlock staff, marketplace and the AI assistant.
          </p>
        </div>
      </div>
      <Button
        size="sm"
        className="bg-zimbabwe-green hover:bg-zimbabwe-darkGreen text-white"
        onClick={() => navigate('/auth')}
      >
        Save my data
      </Button>
    </div>
  );
};
