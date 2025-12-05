import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, UserPlus, Briefcase, Lock } from 'lucide-react';
import { useSubscriptionPermissions } from '@/hooks/useSubscriptionPermissions';
import { useLanguage } from '@/contexts/LanguageContext';

interface JoinBusinessProps {
  onComplete?: () => void;
}

export function JoinBusiness({ onComplete }: JoinBusinessProps) {
  const { createBusiness, joinBusiness, hasBusiness, loading } = useBusiness();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { canUseEmployeeSystem, isFree } = useSubscriptionPermissions();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [inviteCode, setInviteCode] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (hasBusiness) {
    return null;
  }

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await createBusiness(businessName || 'My Business');

    setSubmitting(false);

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Business Created',
        description: 'Your business has been set up successfully!',
      });
      onComplete?.();
    }
  };

  const handleJoinBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an invite code',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    const { error } = await joinBusiness(inviteCode.trim());

    setSubmitting(false);

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'You have joined the business successfully!',
      });
      onComplete?.();
    }
  };

  if (mode === 'create') {
    // If free tier, show upgrade prompt for creating business with employee features
    if (isFree) {
      return (
        <Card className="w-full max-w-md mx-auto border-2 border-dashed border-gray-300 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-400" />
              {t.tierPremiumFeature || 'Premium Feature'}
            </CardTitle>
            <CardDescription>
              {t.employeeSystemDescription || 'The employee/staff system is a premium feature that allows you to invite employees to record sales.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{t.tierEmployeeSystem || 'Employee/Staff System'} {t.tierIncludes || 'includes'}:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ {t.tierInviteEmployees || 'Invite employees with secure codes'}</li>
                <li>✓ {t.tierEmployeeSalesRecording || 'Employees can record sales'}</li>
                <li>✓ {t.tierProtectFinancials || 'Protect your financial data'}</li>
                <li>✓ {t.tierManageStaff || 'Manage staff access'}</li>
              </ul>
            </div>
            <Button
              className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen"
              onClick={() => {
                const subscriptionSection = document.querySelector('[data-subscription-status]');
                if (subscriptionSection) {
                  subscriptionSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {t.upgradeToPlansAction || 'Upgrade to Premium'} - $1.99/{t.month || 'month'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setMode('choose')}
            >
              {t.cancel || 'Back'}
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create Your Business
          </CardTitle>
          <CardDescription>
            Set up your business to start tracking products and sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBusiness} className="space-y-4">
            <div>
              <Label htmlFor="business-name">Business Name (optional)</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="My Business"
                disabled={submitting}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode('choose')}
                disabled={submitting}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Business'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'join') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join a Business
          </CardTitle>
          <CardDescription>
            Enter the invite code from your employer to join their business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinBusiness} className="space-y-4">
            <div>
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter 8-character code"
                maxLength={8}
                className="font-mono text-lg tracking-wider uppercase"
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ask your employer for the invite code
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode('choose')}
                disabled={submitting}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Joining...' : 'Join Business'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Welcome to Tengesa4Profit</CardTitle>
        <CardDescription>
          Are you a business owner or an employee?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setMode('create')}
        >
          <Briefcase className="h-8 w-8" />
          <div>
            <p className="font-semibold">I'm a Business Owner</p>
            <p className="text-xs text-muted-foreground">
              Create your business and invite employees
            </p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setMode('join')}
        >
          <UserPlus className="h-8 w-8" />
          <div>
            <p className="font-semibold">I'm an Employee</p>
            <p className="text-xs text-muted-foreground">
              Join your employer's business with an invite code
            </p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
