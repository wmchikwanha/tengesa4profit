
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateProduct, Product } from '@/lib/types';
import { ProductSummaryItem } from './ProductSummaryItem';

interface SalesHistoryRecord {
  date: string;
  totalProfit: number;
  products: Product[];
}

interface ProductSummaryProps {
  products: Product[];
  salesHistory: SalesHistoryRecord[];
  totalSalesValue: number;
  totalCostValue: number;
  totalProfit: number;
  totalDiscardedValue?: number;
  totalDiscardedQuantity?: number;
  calculateTotalSalesPerProduct: (productId: string) => {
    totalQuantitySold: number;
    totalQuantityDiscarded: number;
    totalProfit: number;
    totalSalesValue: number;
    totalCostValue: number;
    totalDiscardedValue: number;
  };
}

export const ProductSummary: React.FC<ProductSummaryProps> = ({
  products,
  salesHistory,
  totalSalesValue,
  totalCostValue, 
  totalProfit,
  totalDiscardedValue = 0,
  totalDiscardedQuantity = 0,
  calculateTotalSalesPerProduct
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  return (
    <Card className="bg-white border border-zimbabwe-green">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-zimbabwe-darkGreen">{t.productSummary}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map(product => (
          <ProductSummaryItem
            key={product.id}
            product={product}
            calculateTotalSalesPerProduct={calculateTotalSalesPerProduct}
          />
        ))}
        
        {/* Display grand total at the bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-zimbabwe-lightGreen rounded-lg font-bold mt-2">
          <div className="flex justify-between md:justify-start md:flex-col">
            <span>{t.totalSalesValue}:</span>
            <span className="ml-2 md:ml-0">{formatPrice(totalSalesValue)}</span>
          </div>
          <div className="flex justify-between md:justify-start md:flex-col">
            <span>{t.totalCostValue}:</span>
            <span className="ml-2 md:ml-0">{formatPrice(totalCostValue)}</span>
          </div>
          <div className="flex justify-between md:justify-start md:flex-col text-lg text-zimbabwe-darkGreen">
            <span>{t.totalProfit}:</span>
            <span className="ml-2 md:ml-0">{formatPrice(totalProfit)}</span>
          </div>
        </div>
        
        {/* Add discarded totals */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-red-50 rounded-lg mt-2">
          <div className="flex justify-between md:justify-start md:flex-col">
            <span className="text-red-700">{t.totalDiscardedQty}:</span>
            <span className="ml-2 md:ml-0 text-red-700">{totalDiscardedQuantity}</span>
          </div>
          <div className="flex justify-between md:justify-start md:flex-col">
            <span className="text-red-700">{t.totalDiscardedValue}:</span>
            <span className="ml-2 md:ml-0 text-red-700">{formatPrice(totalDiscardedValue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
