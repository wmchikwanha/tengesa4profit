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
  const { subscriptionStatus } = useAuth();
  
  const tier = subscriptionStatus.tier;
  const isSubscribed = subscriptionStatus.subscribed;
  
  // Calculate if trial has expired
  const trialExpired = subscriptionStatus.trialEnd ? 
    new Date() > new Date(subscriptionStatus.trialEnd) : false;
  
  const isTrial = tier === 'trial' && !trialExpired;
  const isFree = tier === 'free' || (tier === 'trial' && trialExpired && !isSubscribed);
  const isPremium = tier === 'premium' && isSubscribed;
  
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