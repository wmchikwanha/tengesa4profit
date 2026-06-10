
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { RoleSelector } from './RoleSelector';
import { SupplierDashboard } from './SupplierDashboard';
import { TraderMarketplace } from './TraderMarketplace';
import { useAnalytics } from '@/hooks/useAnalytics';

const Marketplace: React.FC = () => {
  const { userRole } = useMarketplace();
  const { trackEvent } = useAnalytics();

  React.useEffect(() => {
    trackEvent('marketplace_viewed', { role: userRole });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  return (
    <div className="space-y-6">
      <RoleSelector />
      
      {(userRole === 'supplier' || userRole === 'both') && (
        <SupplierDashboard />
      )}
      
      {(userRole === 'trader' || userRole === 'both') && (
        <TraderMarketplace />
      )}
    </div>
  );
};

export default Marketplace;
