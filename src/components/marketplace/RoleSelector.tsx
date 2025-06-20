
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/lib/marketplace-types';

export const RoleSelector: React.FC = () => {
  const { userRole, setUserRole } = useMarketplace();
  const { t } = useLanguage();

  const roles = [
    { value: 'trader' as UserRole, label: t.traderRole, description: t.traderRoleDesc },
    { value: 'supplier' as UserRole, label: t.supplierRole, description: t.supplierRoleDesc },
    { value: 'both' as UserRole, label: t.bothRole, description: t.bothRoleDesc },
  ];

  return (
    <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
      <CardHeader>
        <CardTitle>{t.selectYourRole}</CardTitle>
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
