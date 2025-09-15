import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionPermissions {
  // Trial: Full access to everything
  // Free: Sales/profit without reporting, marketplace browsing only
  // Premium: Full access
  
  canUseReporting: boolean;
  canShareReports: boolean;
  canDownloadReports: boolean;
  canAccessMarketplace: boolean;
  canContactSuppliers: boolean;
  canListProducts: boolean;
  showUpgradePrompt: (feature: string) => boolean;
}

export const useSubscriptionPermissions = (): SubscriptionPermissions => {
  const { subscriptionStatus, user } = useAuth();
  
  // Determine effective trial end: prefer backend value, fallback to local per-user key
  const localTrialEnd = user ? localStorage.getItem(`t4p:${user.id}:trialEnd`) : null;
  const effectiveTrialEnd = subscriptionStatus.trialEnd ?? localTrialEnd;

  const isSubscribed = subscriptionStatus.subscribed === true;
  const isPremium = isSubscribed && subscriptionStatus.tier === 'premium';

  // Calculate if trial has expired using effective trial end
  const trialExpired = effectiveTrialEnd ? new Date() > new Date(effectiveTrialEnd) : false;

  // Treat as trial if not premium and we have a non-expired trial window
  const isTrial = !isPremium && !!effectiveTrialEnd && !trialExpired;
  
  // Free when not premium and not within active trial
  const isFree = !isPremium && !isTrial;
  
  return {
    // Trial and Premium get full access
    canUseReporting: isTrial || isPremium,
    canShareReports: isTrial || isPremium,
    canDownloadReports: isTrial || isPremium,
    
    // All tiers can access marketplace, but with different capabilities
    canAccessMarketplace: true,
    
    // Only trial and premium can contact suppliers
    canContactSuppliers: isTrial || isPremium,
    
    // Only trial and premium can list products
    canListProducts: isTrial || isPremium,
    
    // Show upgrade prompt for free tier when trying to use premium features
    showUpgradePrompt: (feature: string) => {
      return isFree && (
        feature === 'reporting' ||
        feature === 'contact_suppliers' ||
        feature === 'list_products' ||
        feature === 'share_reports' ||
        feature === 'download_reports'
      );
    }
  };
};