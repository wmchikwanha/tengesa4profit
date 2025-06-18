
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/lib/marketplace-types';

export const RoleSelector: React.FC = () => {
  const { userRole, setUserRole } = useMarketplace();

  const roles = [
    { value: 'trader' as UserRole, label: 'Trader', description: 'Buy products from suppliers' },
    { value: 'supplier' as UserRole, label: 'Supplier', description: 'Sell products to traders' },
    { value: 'both' as UserRole, label: 'Both', description: 'Buy and sell products' },
  ];

  return (
    <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
      <CardHeader>
        <CardTitle>Select Your Role</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Button
              key={role.value}
              variant={userRole === role.value ? 'default' : 'outline'}
              className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                userRole === role.value 
                  ? 'bg-zimbabwe-green text-white border-zimbabwe-darkGreen' 
                  : 'border-zimbabwe-green text-zimbabwe-darkGreen hover:bg-zimbabwe-lightGreen'
              }`}
              onClick={() => setUserRole(role.value)}
            >
              <span className="font-semibold">{role.label}</span>
              <span className="text-sm text-center opacity-80">{role.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
