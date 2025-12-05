import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppData } from '@/contexts/AppDataContext';
import { Package, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface TodaySale {
  productName: string;
  quantitySold: number;
  unit: string;
}

const EmployeeSalesCard: React.FC = () => {
  const { salesHistory } = useAppData();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Get today's sales from history
  const todaysSales = React.useMemo(() => {
    if (!salesHistory) return [];
    
    const sales: TodaySale[] = [];
    
    salesHistory.forEach(record => {
      if (record.date === today) {
        record.products?.forEach((product: any) => {
          if (product.quantitySold > 0) {
            sales.push({
              productName: product.name,
              quantitySold: product.quantitySold,
              unit: product.unit || 'piece'
            });
          }
        });
      }
    });
    
    return sales;
  }, [salesHistory, today]);
  
  const totalItemsSold = todaysSales.reduce((sum, sale) => sum + sale.quantitySold, 0);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Sales Today
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), 'dd MMM yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        {todaysSales.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No sales recorded yet today</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{totalItemsSold}</p>
              <p className="text-sm text-muted-foreground">Total items sold</p>
            </div>
            
            <div className="divide-y">
              {todaysSales.map((sale, index) => (
                <div key={index} className="py-2 flex justify-between items-center">
                  <span className="font-medium">{sale.productName}</span>
                  <span className="text-muted-foreground">
                    {sale.quantitySold} {sale.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeSalesCard;
