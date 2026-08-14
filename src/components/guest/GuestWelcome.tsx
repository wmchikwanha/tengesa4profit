import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGuestMode, GUEST_TRIAL_DAYS } from '@/contexts/GuestModeContext';
import { ShieldCheck, WifiOff, Clock, ArrowRight } from 'lucide-react';

export const GuestWelcome: React.FC = () => {
  const { startGuest } = useGuestMode();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-zimbabwe-darkGreen">Tengesa4Profit</h1>
          <p className="text-muted-foreground mt-2">
            Know your profit every day. Start now — no sign up needed.
          </p>
        </header>

        <Card className="border-zimbabwe-green">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-zimbabwe-green mt-0.5 shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">{GUEST_TRIAL_DAYS} days free.</span> Use the app fully
                without an account. We only ask you to sign up when the {GUEST_TRIAL_DAYS} days end.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-zimbabwe-green mt-0.5 shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">Your data stays on your phone.</span> No email, no
                phone number, nothing sent to our servers while you try it.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <WifiOff className="h-5 w-5 text-zimbabwe-green mt-0.5 shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">Works offline.</span> No data bundles needed once the
                app is open.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen text-white text-base"
              onClick={startGuest}
            >
              Start using it now — free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
              I already have an account
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Staff joining a business with an invite code should sign in instead.
        </p>
      </div>
    </div>
  );
};
