import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Circle, AlertTriangle } from 'lucide-react';
import type { MigrationStatus } from '@/hooks/useGuestMigration';

interface Props {
  status: MigrationStatus;
  onContinue: () => void;
}

export const GuestMigrationScreen: React.FC<Props> = ({ status, onContinue }) => (
  <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white flex items-center justify-center p-4">
    <Card className="w-full max-w-md border-zimbabwe-green">
      <CardContent className="p-6 space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-zimbabwe-darkGreen">
            {status.finished ? 'All your records are safe' : 'Saving your records to your account'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {status.finished
              ? 'Everything you entered on this phone is now in your account.'
              : 'Please keep this page open. This takes a few seconds.'}
          </p>
        </div>

        <ul className="space-y-3">
          {status.steps.map(step => (
            <li key={step.key} className="flex items-center gap-3">
              {step.state === 'done' && <Check className="h-5 w-5 text-zimbabwe-green shrink-0" />}
              {step.state === 'active' && (
                <Loader2 className="h-5 w-5 text-zimbabwe-green animate-spin shrink-0" />
              )}
              {step.state === 'pending' && (
                <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
              )}
              {step.state === 'error' && (
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              )}
              <span className="text-sm">
                {step.label}
                {step.key !== 'cleanup' && (
                  <span className="text-muted-foreground"> — {step.count}</span>
                )}
              </span>
            </li>
          ))}
        </ul>

        {status.error && <p className="text-sm text-destructive">{status.error}</p>}

        <Button
          className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen text-white"
          disabled={status.migrating}
          onClick={onContinue}
        >
          {status.migrating ? 'Please wait…' : status.error ? 'Continue anyway' : 'Continue to my business'}
        </Button>
      </CardContent>
    </Card>
  </div>
);
