
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { RoleSelector } from './RoleSelector';
import { SupplierDashboard } from './SupplierDashboard';
import { TraderMarketplace } from './TraderMarketplace';

const Marketplace: React.FC = () => {
  const { userRole } = useMarketplace();

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
