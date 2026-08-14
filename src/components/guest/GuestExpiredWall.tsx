import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GUEST_TRIAL_DAYS } from '@/contexts/GuestModeContext';
import { Lock } from 'lucide-react';

export const GuestExpiredWall: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-zimbabwe-green">
        <CardContent className="p-6 space-y-4 text-center">
          <Lock className="h-8 w-8 text-zimbabwe-green mx-auto" />
          <h1 className="text-2xl font-bold text-zimbabwe-darkGreen">
            Your {GUEST_TRIAL_DAYS} free days are over
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a free account to keep going. Your records on this phone are still here and will be
            copied to your account the moment you sign up.
          </p>
          <Button
            size="lg"
            className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen text-white"
            onClick={() => navigate('/auth')}
          >
            Create my free account
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
            I already have an account
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => navigate('/privacy-center')}
          >
            Privacy & my data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
