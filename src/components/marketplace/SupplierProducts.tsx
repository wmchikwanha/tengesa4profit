
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SupplierProducts: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Products</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-zimbabwe-darkGreen">
          Product management functionality coming in Phase 2
        </p>
      </CardContent>
    </Card>
  );
};
