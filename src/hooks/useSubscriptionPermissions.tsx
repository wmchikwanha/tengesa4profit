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
  
  // Determine effective trial end with robust fallback that does not rely on visiting the subscription screen
  const storageKey = user ? `t4p:${user.id}:trialEnd` : null;
  let localTrialEnd = storageKey ? localStorage.getItem(storageKey) : null;
  const serverTrialEnd = subscriptionStatus.trialEnd;

  // If neither server nor local value exists (new account), start a 30-day trial and persist it
  if (!serverTrialEnd && !localTrialEnd && user) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    localTrialEnd = thirtyDaysFromNow.toISOString();
    localStorage.setItem(storageKey!, localTrialEnd);
  }

  const effectiveTrialEnd = serverTrialEnd ?? localTrialEnd;

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