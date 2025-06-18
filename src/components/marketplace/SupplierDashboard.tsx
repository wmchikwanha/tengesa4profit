
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SupplierProfile } from './SupplierProfile';
import { SupplierProducts } from './SupplierProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const SupplierDashboard: React.FC = () => {
  const { supplierProfile } = useMarketplace();

  return (
    <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
      <CardHeader>
        <CardTitle>Supplier Dashboard</CardTitle>
        {!supplierProfile && (
          <p className="text-sm text-zimbabwe-darkGreen opacity-80">
            Complete your profile to start listing products
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile & Settings</TabsTrigger>
            <TabsTrigger value="products" disabled={!supplierProfile}>
              My Products
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <SupplierProfile />
          </TabsContent>
          
          <TabsContent value="products" className="mt-6">
            {supplierProfile ? (
              <SupplierProducts />
            ) : (
              <p className="text-center text-zimbabwe-darkGreen">
                Please complete your profile first
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
