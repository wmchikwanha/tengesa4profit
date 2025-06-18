
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TraderMarketplace: React.FC = () => {
  return (
    <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
      <CardHeader>
        <CardTitle>Marketplace</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-zimbabwe-darkGreen">
          Search and browse products from suppliers (Coming in Phase 2)
        </p>
      </CardContent>
    </Card>
  );
};
