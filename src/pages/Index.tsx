
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAppData } from '@/contexts/AppDataContext';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { TierComparisonCard } from '@/components/subscription/TierComparisonCard';
import ProductForm from '@/components/ProductForm';
import TallyProfit from '@/components/profit-tally/TallyProfit';
import Marketplace from '@/components/marketplace/Marketplace';
import { JoinBusiness } from '@/components/staff/JoinBusiness';
import { Badge } from '@/components/ui/badge';
import EmployeeSalesCard from '@/components/EmployeeSalesCard';
import { useSubscriptionPermissions } from '@/hooks/useSubscriptionPermissions';
import { useAnalytics } from '@/hooks/useAnalytics';
import { PrivacyBanner } from '@/components/PrivacyBanner';
import { useGuestMode } from '@/contexts/GuestModeContext';
import { GuestWelcome } from '@/components/guest/GuestWelcome';
import { GuestExpiredWall } from '@/components/guest/GuestExpiredWall';
import { GuestTrialBanner } from '@/components/guest/GuestTrialBanner';
import { useGuestMigration } from '@/hooks/useGuestMigration';

export default function Index() {
  const { user, loading, signOut, subscriptionStatus } = useAuth();
  const { hasBusiness, loading: businessLoading, isOwner, isEmployee, businessInfo, permissions } = useBusiness();
  const { loading: dataLoading } = useAppData();
  const { isTrial, isFree, trialDaysLeft } = useSubscriptionPermissions();
  const { trackEvent } = useAnalytics();
  const { isGuest, guestExpired } = useGuestMode();
  useGuestMigration();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && hasBusiness) {
      trackEvent('page_view', {
        page: 'home',
        role: isOwner ? 'owner' : 'employee',
        subscribed: subscriptionStatus.subscribed,
        tier: subscriptionStatus.tier,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, hasBusiness]);

  if (loading || businessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zimbabwe-green mx-auto mb-4"></div>
          <p className="text-zimbabwe-darkGreen">Loading...</p>
        </div>
      </div>
    );
  }

  // No account: offer the free 60-day guest run, or the sign-up wall once it ends
  if (!user) {
    if (guestExpired) return <GuestExpiredWall />;
    if (!isGuest) return <GuestWelcome />;
  }

  // If user doesn't have a business, show the join/create flow
  if (!hasBusiness && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-zimbabwe-darkGreen mb-8">
          Welcome to Tengesa4Profit
        </h1>
        <JoinBusiness />
        <Button
          variant="ghost"
          onClick={signOut}
          className="mt-8 text-muted-foreground"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zimbabwe-lightGreen to-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zimbabwe-darkGreen">
              {businessInfo?.name || 'My Business'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isOwner ? 'default' : 'secondary'}>
                {isOwner ? 'Owner' : 'Employee'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {user ? user.email : 'Guest — this phone only'}
              </span>
            </div>
          </div>
          {user ? (
            <Button 
              onClick={signOut}
              variant="outline"
              className="border-zimbabwe-green text-zimbabwe-green hover:bg-zimbabwe-green hover:text-white"
            >
              Sign Out
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              className="border-zimbabwe-green text-zimbabwe-green hover:bg-zimbabwe-green hover:text-white"
            >
              Create account
            </Button>
          )}
        </div>

        {isGuest ? <GuestTrialBanner /> : <PrivacyBanner />}

        {/* Show tier comparison and subscription status for owners */}
        {!isGuest && isOwner && !subscriptionStatus.subscribed && (
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <TierComparisonCard />
            <SubscriptionStatus />
          </div>
        )}
        
        {/* Show only subscription status for subscribed owners */}
        {!isGuest && isOwner && subscriptionStatus.subscribed && (
          <div className="mb-8">
            <SubscriptionStatus />
          </div>
        )}
        
        {/* Employee view - simplified with sales dashboard */}
        {isEmployee && (
          <div className="mb-6 space-y-4">
            <div className="bg-muted/50 border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                You are logged in as an employee. You can view stock and record sales.
              </p>
            </div>
            <EmployeeSalesCard />
          </div>
        )}
        
        <AppLayout 
          addProductContent={permissions.canAddProducts ? <ProductForm /> : null}
          tallyProfitContent={<TallyProfit />}
          marketplaceContent={permissions.canAccessReports ? <Marketplace /> : null}
        />
      </div>
    </div>
  );
}
