import React, { createContext, useContext, ReactNode } from 'react';
import { useBusinessRole, BusinessRole, BusinessPermissions, BusinessInfo } from '@/hooks/useBusinessRole';

interface BusinessContextType {
  role: BusinessRole;
  businessId: string | null;
  businessInfo: BusinessInfo | null;
  permissions: BusinessPermissions;
  loading: boolean;
  isOwner: boolean;
  isEmployee: boolean;
  hasBusiness: boolean;
  createBusiness: (name?: string) => Promise<{ data?: any; error: string | null }>;
  joinBusiness: (inviteCode: string) => Promise<{ data?: any; error: string | null }>;
  regenerateInviteCode: () => Promise<{ data?: string | null; error: string | null }>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const businessRole = useBusinessRole();

  return (
    <BusinessContext.Provider value={businessRole}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
