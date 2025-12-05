
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const SubscriptionStatus: React.FC = () => {
  const { user, subscriptionStatus, refreshSubscription } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  // removed manual refresh to prevent incorrect state toggles
  const { toast } = useToast();

  const [effectiveTrialEnd, setEffectiveTrialEnd] = useState<string | null>(null);

  // Track latest subscribed state to avoid stale closure inside polling interval
  const subscribedRef = useRef(subscriptionStatus.subscribed);
  useEffect(() => {
    subscribedRef.current = subscriptionStatus.subscribed;
  }, [subscriptionStatus.subscribed]);

  useEffect(() => {
    if (!user) return;

    const storageKey = `t4p:${user.id}:trialEnd`;
    let end = subscriptionStatus.trialEnd;

    if (!end) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        end = stored;
      } else {
        const oneDayFromNow = new Date();
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
        end = oneDayFromNow.toISOString();
        localStorage.setItem(storageKey, end);
      }
    } else {
      localStorage.setItem(storageKey, end);
    }

    setEffectiveTrialEnd(end);
  }, [user?.id, subscriptionStatus.trialEnd]);

  // Refresh subscription when component mounts and periodically
  useEffect(() => {
    if (user) {
      refreshSubscription();
      
      // Also refresh every 30 seconds to catch status changes
      const interval = setInterval(() => {
        refreshSubscription();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id]);


  const calculateDaysLeft = (endDate: string | null) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleCheckout = async (tier: string, price: number) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier, price },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      
      if (error) throw error;
      
      if (data?.url) {
        // Open payment page in a new tab
        window.open(data.url, '_blank');

        // Also refresh when user returns focus to the app
        const onFocus = async () => {
          await refreshSubscription();
        };
        window.addEventListener('focus', onFocus);

        // Poll for subscription status while checkout is in progress
        const pollInterval = setInterval(async () => {
          await refreshSubscription();

          // Check latest subscribed state via ref to avoid stale closure
          if (subscribedRef.current) {
            clearInterval(pollInterval);
            window.removeEventListener('focus', onFocus);
            toast({
              title: "Success",
              description: "Your subscription has been activated!",
            });
          }
        }, 3000); // Check every 3 seconds

        // Stop polling after 5 minutes (cleanup)
        setTimeout(() => {
          clearInterval(pollInterval);
          window.removeEventListener('focus', onFocus);
        }, 300000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Try the new customer portal function first
      const { data, error } = await supabase.functions.invoke('customer-portal-v2', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (error) {
        console.error('Customer portal error:', error);
        throw new Error(error.message || 'Failed to open customer portal');
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Customer portal error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const trialDaysLeft = calculateDaysLeft(effectiveTrialEnd);
  const subscriptionDaysLeft = calculateDaysLeft(subscriptionStatus.subscriptionEnd);

  const plans = [
    {
      name: 'Premium',
      tier: 'premium',
      price: 199, // $1.99 in cents
      features: [
        'Full sales & profit reporting', 
        'Share & download reports', 
        'Complete marketplace access', 
        'Contact suppliers directly',
        'List your own products',
        'Priority support'
      ]
    }
  ];

  return (
    <div className="space-y-6" data-subscription-status>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <span className="break-words">{t.subscriptionStatus}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionStatus.subscribed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default" className="bg-green-500">Active</Badge>
                <span className="font-medium break-words capitalize">{subscriptionStatus.tier || 'Premium'} Subscription</span>
              </div>
              <p className="text-sm text-gray-600 break-words">
                {subscriptionDaysLeft > 0 
                  ? `${subscriptionDaysLeft} ${t.daysLeft}`
                  : 'Subscription expired'
                }
              </p>
              <Button 
                onClick={handleManageSubscription}
                disabled={loading}
                variant="outline"
                className="text-xs sm:text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="break-words">Opening...</span>
                  </>
                ) : (
                  <span className="break-words">{t.manageSubscription}</span>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={trialDaysLeft === 0 ? "destructive" : "secondary"}>
                  {trialDaysLeft === 0 ? "Trial Expired" : "Trial"}
                </Badge>
                <span className="font-medium break-words">
                  {trialDaysLeft > 0 ? `${trialDaysLeft} ${t.daysLeft}` : "Subscribe to continue"}
                </span>
              </div>
              {trialDaysLeft === 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm font-semibold text-red-900 mb-2 break-words">
                    Trial Expired - Subscribe Now
                  </p>
                  <p className="text-sm text-red-800 break-words">
                    {t.trialMessage || 'Your trial has ended. Upgrade to premium to continue using all features.'}
                  </p>
                </div>
              ) : trialDaysLeft <= 7 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800 break-words">
                    {t.trialExpiresSoon}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {!subscriptionStatus.subscribed && (
        <div className="max-w-md mx-auto">
          {plans.map((plan) => (
            <Card key={plan.tier} className="relative">
              <CardHeader>
                <CardTitle className="text-lg break-words">{plan.name}</CardTitle>
                <div className="text-2xl font-bold">
                  ${(plan.price / 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-600 break-words">/{t.month}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <span className="w-1 h-1 bg-zimbabwe-green rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      <span className="break-words">{t.premiumBenefits[index] || feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen text-xs sm:text-sm"
                  onClick={() => handleCheckout(plan.tier, plan.price)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="break-words">Loading...</span>
                    </>
                  ) : (
                    <span className="break-words">{t.upgradeToPlansAction}</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
