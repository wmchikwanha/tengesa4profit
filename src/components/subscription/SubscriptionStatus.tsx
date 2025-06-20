
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionStatus: React.FC = () => {
  const { user, subscriptionStatus, refreshSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier, price }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session",
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
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trialDaysLeft = calculateDaysLeft(subscriptionStatus.trialEnd);
  const subscriptionDaysLeft = calculateDaysLeft(subscriptionStatus.subscriptionEnd);

  const plans = [
    {
      name: 'Trader',
      tier: 'trader',
      price: 99, // $0.99 in cents
      features: ['Access marketplace', 'Browse products', 'Contact suppliers']
    },
    {
      name: 'Supplier',
      tier: 'supplier', 
      price: 199, // $1.99 in cents
      features: ['List products', 'Manage inventory', 'Access marketplace']
    },
    {
      name: 'Both',
      tier: 'both',
      price: 299, // $2.99 in cents
      features: ['Full marketplace access', 'List products', 'Browse & buy', 'Priority support']
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Subscription Status
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshSubscription}
              disabled={loading}
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionStatus.subscribed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">Active</Badge>
                <span className="font-medium">{subscriptionStatus.tier} Plan</span>
              </div>
              <p className="text-sm text-gray-600">
                {subscriptionDaysLeft > 0 
                  ? `${subscriptionDaysLeft} days remaining`
                  : 'Subscription expired'
                }
              </p>
              <Button 
                onClick={handleManageSubscription}
                disabled={loading}
                variant="outline"
              >
                Manage Subscription
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Trial</Badge>
                <span className="font-medium">
                  {trialDaysLeft > 0 ? `${trialDaysLeft} days left` : 'Trial expired'}
                </span>
              </div>
              {trialDaysLeft <= 7 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    Your trial expires soon! Upgrade to continue using premium features.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!subscriptionStatus.subscribed && (
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.tier} className="relative">
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-2xl font-bold">
                  ${(plan.price / 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-center">
                      <span className="w-1 h-1 bg-zimbabwe-green rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen"
                  onClick={() => handleCheckout(plan.tier, plan.price)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
