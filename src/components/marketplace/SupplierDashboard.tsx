
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SupplierProfileForm } from './SupplierProfile';
import { SupplierProducts } from './SupplierProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CurrencySelector from '@/components/CurrencySelector';

export const SupplierDashboard: React.FC = () => {
  const { supplierProfile } = useMarketplace();
  const { t } = useLanguage();

  return (
    <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="break-words text-base sm:text-lg">{t.supplierDashboard}</CardTitle>
            {!supplierProfile && (
              <p className="text-sm text-zimbabwe-darkGreen opacity-80 break-words">
                Complete your profile to start listing products
              </p>
            )}
          </div>
          <div className="shrink-0">
            <CurrencySelector />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="text-xs sm:text-sm break-words">
              {t.profileSettings}
            </TabsTrigger>
            <TabsTrigger value="products" disabled={!supplierProfile} className="text-xs sm:text-sm break-words">
              {t.myProducts}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <SupplierProfileForm />
          </TabsContent>
          
          <TabsContent value="products" className="mt-6">
            {supplierProfile ? (
              <div className="max-h-96 overflow-y-auto">
                <SupplierProducts />
              </div>
            ) : (
              <p className="text-center text-zimbabwe-darkGreen break-words">
                Please complete your profile first
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
