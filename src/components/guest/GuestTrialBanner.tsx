import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGuestMode } from '@/contexts/GuestModeContext';
import { GuestDataTools } from '@/components/guest/GuestDataTools';
import { ShieldCheck } from 'lucide-react';

export const GuestTrialBanner: React.FC = () => {
  const { guestDaysLeft, guestHoursLeft, guestEndsAt } = useGuestMode();
  const navigate = useNavigate();

  const countdown =
    guestDaysLeft > 1
      ? `${guestDaysLeft} days left`
      : guestHoursLeft > 1
        ? `${guestHoursLeft} hours left`
        : 'Less than 1 hour left';

  return (
    <div className="mb-6 rounded-lg border border-zimbabwe-green bg-white/70 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-zimbabwe-green mt-0.5 shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">Guest — no account</Badge>
              <span className="text-sm font-medium">{countdown}</span>
              {guestEndsAt && (
                <span className="text-xs text-muted-foreground">
                  Free until {format(guestEndsAt, 'dd/MM/yyyy')}
                </span>
              )}
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
      <GuestDataTools />
    </div>
  );
};

