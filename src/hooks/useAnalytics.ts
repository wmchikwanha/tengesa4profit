import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';

/**
 * Lightweight analytics tracking hook.
 * Silently fails — never blocks UI on tracking errors.
 */
export const useAnalytics = () => {
  const { user } = useAuth();
  const { businessInfo } = useBusiness();

  const trackEvent = useCallback(
    async (eventName: string, eventData: Record<string, any> = {}) => {
      if (!user) return;
      try {
        await supabase.from('analytics_events').insert({
          user_id: user.id,
          business_id: businessInfo?.id ?? null,
          event_name: eventName,
          event_data: eventData,
        });
      } catch (err) {
        // Silent fail — analytics should never break the app
        console.debug('[analytics] tracking failed', err);
      }
    },
    [user, businessInfo?.id]
  );

  return { trackEvent };
};

/**
 * Fire-and-forget standalone tracker for use outside React components
 * (e.g. in AuthContext where hooks can't be called).
 */
export const trackEventStandalone = async (
  userId: string,
  eventName: string,
  eventData: Record<string, any> = {},
  businessId?: string | null
) => {
  try {
    await supabase.from('analytics_events').insert({
      user_id: userId,
      business_id: businessId ?? null,
      event_name: eventName,
      event_data: eventData,
    });
  } catch (err) {
    console.debug('[analytics] tracking failed', err);
  }
};
