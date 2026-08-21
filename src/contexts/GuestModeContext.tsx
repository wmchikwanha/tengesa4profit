import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const GUEST_BUSINESS_ID = 'guest-local';
export const GUEST_TRIAL_DAYS = 60;

const KEY_STARTED = 't4p:guest:startedAt';
export const GUEST_KEYS = {
  started: KEY_STARTED,
  products: 't4p:guest:products',
  sales: 't4p:guest:sales',
  name: 't4p:guest:businessName',
};

interface GuestModeContextType {
  /** True when the app is being used without an account (and the free window is still open). */
  isGuest: boolean;
  /** True when a guest session exists but the 60-day window has ended. */
  guestExpired: boolean;
  guestStartedAt: string | null;
  guestDaysLeft: number;
  /** Exact end date of the free window (null when no guest session). */
  guestEndsAt: Date | null;
  /** Hours left within the current day, for the final 48h. */
  guestHoursLeft: number;
  businessName: string;
  startGuest: () => void;
  setBusinessName: (name: string) => void;
  /** Removes every trace of the local guest session from this device. */
  clearGuestData: () => void;
}

const GuestModeContext = React.createContext<GuestModeContextType | undefined>(undefined);

export const useGuestMode = () => {
  const ctx = React.useContext(GuestModeContext);
  if (!ctx) throw new Error('useGuestMode must be used within a GuestModeProvider');
  return ctx;
};

const endTime = (startedAt: string | null) => {
  if (!startedAt) return null;
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return null;
  return start + GUEST_TRIAL_DAYS * 24 * 60 * 60 * 1000;
};

const remainingMs = (startedAt: string | null) => {
  const end = endTime(startedAt);
  if (end === null) return 0;
  return Math.max(0, end - Date.now());
};


export const GuestModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [guestStartedAt, setGuestStartedAt] = React.useState<string | null>(() => {
    try {
      return localStorage.getItem(KEY_STARTED);
    } catch {
      return null;
    }
  });
  const [businessName, setBusinessNameState] = React.useState<string>(() => {
    try {
      return localStorage.getItem(GUEST_KEYS.name) || 'My Business';
    } catch {
      return 'My Business';
    }
  });

  const startGuest = React.useCallback(() => {
    const now = new Date().toISOString();
    try {
      localStorage.setItem(KEY_STARTED, now);
    } catch {
      /* storage unavailable */
    }
    setGuestStartedAt(now);
  }, []);

  const setBusinessName = React.useCallback((name: string) => {
    try {
      localStorage.setItem(GUEST_KEYS.name, name);
    } catch {
      /* storage unavailable */
    }
    setBusinessNameState(name);
  }, []);

  const clearGuestData = React.useCallback(() => {
    try {
      Object.values(GUEST_KEYS).forEach(k => localStorage.removeItem(k));
      localStorage.removeItem(`t4p:${GUEST_BUSINESS_ID}:lastClearDate`);
    } catch {
      /* storage unavailable */
    }
    setGuestStartedAt(null);
    setBusinessNameState('My Business');
  }, []);

  const daysLeft = daysLeftFrom(guestStartedAt);
  const hasGuestSession = !user && !!guestStartedAt;

  const value: GuestModeContextType = {
    isGuest: hasGuestSession && daysLeft > 0,
    guestExpired: hasGuestSession && daysLeft === 0,
    guestStartedAt,
    guestDaysLeft: daysLeft,
    businessName,
    startGuest,
    setBusinessName,
    clearGuestData,
  };

  return <GuestModeContext.Provider value={value}>{children}</GuestModeContext.Provider>;
};
