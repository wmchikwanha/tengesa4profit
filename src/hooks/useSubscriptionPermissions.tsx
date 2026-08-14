import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/contexts/GuestModeContext';

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
  canUseEmployeeSystem: boolean;
  canUseAIAssistant: boolean;
  isTrial: boolean;
  isFree: boolean;
  isPremium: boolean;
  trialDaysLeft: number;
  showUpgradePrompt: (feature: string) => boolean;
}

export const useSubscriptionPermissions = (): SubscriptionPermissions => {
  const { subscriptionStatus, user } = useAuth();
  const { isGuest, guestDaysLeft } = useGuestMode();

  // Guest (no account) users get the full 60-day local trial, minus account-only features
  if (isGuest) {
    return {
      canUseReporting: true,
      canShareReports: true,
      canDownloadReports: true,
      canAccessMarketplace: false,
      canContactSuppliers: false,
      canListProducts: false,
      canUseEmployeeSystem: false,
      canUseAIAssistant: false,
      isTrial: true,
      isFree: false,
      isPremium: false,
      trialDaysLeft: guestDaysLeft,
      showUpgradePrompt: () => false,
    };
  }

  
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

  // Calculate days left in trial
  const calculateDaysLeft = () => {
    if (!effectiveTrialEnd) return 0;
    const end = new Date(effectiveTrialEnd);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

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
    
    // Only trial and premium can use employee system
    canUseEmployeeSystem: isTrial || isPremium,
    
    // Only trial and premium can use AI assistant
    canUseAIAssistant: isTrial || isPremium,
    
    // Export tier status for UI display
    isTrial,
    isFree,
    isPremium,
    trialDaysLeft: calculateDaysLeft(),
    
    // Show upgrade prompt for free tier when trying to use premium features
    showUpgradePrompt: (feature: string) => {
      return isFree && (
        feature === 'reporting' ||
        feature === 'contact_suppliers' ||
        feature === 'list_products' ||
        feature === 'share_reports' ||
        feature === 'download_reports' ||
        feature === 'employee_system' ||
        feature === 'ai_assistant'
      );
    }
  };
};