import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface TierComparisonCardProps {
  onUpgrade?: () => void;
}

export const TierComparisonCard: React.FC<TierComparisonCardProps> = ({ onUpgrade }) => {
  const { t } = useLanguage();
  const { user, subscriptionStatus } = useAuth();
  
  // Calculate trial days left
  const storageKey = user ? `t4p:${user.id}:trialEnd` : null;
  const localTrialEnd = storageKey ? localStorage.getItem(storageKey) : null;
  const effectiveTrialEnd = subscriptionStatus.trialEnd ?? localTrialEnd;
  
  const calculateDaysLeft = () => {
    if (!effectiveTrialEnd) return 0;
    const end = new Date(effectiveTrialEnd);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };
  
  const daysLeft = calculateDaysLeft();
  const isTrialActive = daysLeft > 0;
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      const subscriptionSection = document.querySelector('[data-subscription-status]');
      if (subscriptionSection) {
        subscriptionSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  const features = [
    { name: t.tierSalesProfitTracking || 'Sales & Profit Tracking', free: true, premium: true },
    { name: t.tierProductManagement || 'Product Management', free: true, premium: true },
    { name: t.tierMarketplaceBrowsing || 'Marketplace Browsing', free: true, premium: true },
    { name: t.tierViewProductPrices || 'View Product Prices', free: true, premium: true },
    { name: t.tierSalesProfitReports || 'Sales & Profit Reports', free: false, premium: true },
    { name: t.tierDownloadShareReports || 'Download & Share Reports', free: false, premium: true },
    { name: t.tierContactSuppliers || 'Contact Suppliers', free: false, premium: true },
    { name: t.tierListProducts || 'List Products as Supplier', free: false, premium: true },
    { name: t.tierEmployeeSystem || 'Employee/Staff System', free: false, premium: true },
    { name: t.tierAIAssistant || 'AI Business Assistant', free: false, premium: true },
  ];
  
  return (
    <Card className="border-2 border-zimbabwe-green/30 bg-gradient-to-br from-zimbabwe-lightGreen/10 to-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-zimbabwe-gold" />
            {t.freeVsPremium || 'Free vs Premium'}
          </CardTitle>
          {isTrialActive && (
            <Badge variant="secondary" className="bg-zimbabwe-green/10 text-zimbabwe-darkGreen">
              <Clock className="h-3 w-3 mr-1" />
              {daysLeft} {t.daysLeft}
            </Badge>
          )}
        </div>
        {isTrialActive && (
          <p className="text-sm text-muted-foreground mt-2">
            {t.trialIncludesPremium || 'Your trial includes all Premium features'}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feature comparison table */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="font-medium text-muted-foreground">{t.tierFeature || 'Feature'}</div>
          <div className="text-center font-medium text-muted-foreground">{t.tierFree || 'Free'}</div>
          <div className="text-center font-medium text-zimbabwe-green">{t.tierPremium || 'Premium'}</div>
          
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <div className="py-1.5 text-xs sm:text-sm border-t border-border/50">{feature.name}</div>
              <div className="py-1.5 text-center border-t border-border/50">
                {feature.free ? (
                  <Check className="h-4 w-4 text-green-500 mx-auto" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/50 mx-auto" />
                )}
              </div>
              <div className="py-1.5 text-center border-t border-border/50">
                {feature.premium ? (
                  <Check className="h-4 w-4 text-zimbabwe-green mx-auto" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/50 mx-auto" />
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
        
        {/* Upgrade CTA */}
        {!subscriptionStatus.subscribed && (
          <div className="pt-4 border-t">
            <div className="text-center mb-3">
              <span className="text-lg text-muted-foreground line-through mr-2">$2.99</span>
              <span className="text-2xl font-bold text-zimbabwe-darkGreen">$1.99</span>
              <span className="text-muted-foreground">/{t.month}</span>
            </div>
            <p className="text-xs text-center text-zimbabwe-green font-medium mb-3">
              Early Adopter Price!
            </p>
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen"
            >
              {t.upgradeToPlansAction || 'Upgrade to Premium'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
