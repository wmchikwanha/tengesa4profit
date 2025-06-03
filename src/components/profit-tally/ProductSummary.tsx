
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateProduct, Product } from '@/lib/types';

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
    <Card className="bg-white border border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-blue-800">{t.productSummary}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map(product => {
          const calc = calculateProduct(product);
          const totals = calculateTotalSalesPerProduct(product.id);
          
          return (
            <div key={product.id} className="flex flex-col md:flex-row md:justify-between items-start md:items-center p-3 bg-blue-50 rounded-lg">
              <div className="mb-2 md:mb-0">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600">Supplier: {product.supplier}</p>
                <p className="text-sm text-gray-600">
                  {t.sold}: {product.quantitySold} | {t.remaining}: {calc.stockRemaining}
                </p>
                <p className="text-xs font-medium text-blue-700 mt-1">
                  {t.salesQty}: {totals.totalQuantitySold}
                </p>
                <p className="text-xs font-medium text-red-600 mt-1">
                  {t.discardedQty}: {totals.totalQuantityDiscarded}
                </p>
              </div>
              <div className="text-right ml-auto md:ml-0">
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm">{t.salesValue}:</span>
                    <span className="font-medium">{formatPrice(totals.totalSalesValue)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm">{t.costValue}:</span>
                    <span className="font-medium">{formatPrice(totals.totalCostValue)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm">{t.discardedValue}:</span>
                    <span className="font-medium text-red-600">{formatPrice(totals.totalDiscardedValue)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm">{t.dailyProfit}:</span>
                    <span className="font-bold text-blue-700">{formatPrice(calc.dailyProfit)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Display grand total at the bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-blue-100 rounded-lg font-bold mt-2">
          <div className="flex justify-between md:justify-start md:flex-col">
            <span>{t.totalSalesValue}:</span>
            <span className="ml-2 md:ml-0">{formatPrice(totalSalesValue)}</span>
          </div>
          <div className="flex justify-between md:justify-start md:flex-col">
            <span>{t.totalCostValue}:</span>
            <span className="ml-2 md:ml-0">{formatPrice(totalCostValue)}</span>
          </div>
          <div className="flex justify-between md:justify-start md:flex-col text-lg text-blue-800">
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
