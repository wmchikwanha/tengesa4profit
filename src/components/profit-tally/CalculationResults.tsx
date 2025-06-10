
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ProductCalculation } from '@/lib/types';
import { Product } from '@/lib/types';
import { AlertCircle as AlertIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CalculationResultsProps {
  calculation: ProductCalculation | null;
  product?: Product;
}

export const CalculationResults: React.FC<CalculationResultsProps> = ({ calculation, product }) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  if (!calculation) return null;

  const unit = product?.unitOfMeasurement || 'each';

  return (
    <Card className={calculation.lowMargin ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}>
      <CardContent className="pt-6">
        {calculation.lowMargin && (
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <AlertIcon className="h-5 w-5" />
            <p className="font-bold">{t.lowProfitWarning}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold">{t.costPerUnit}:</span>
            <span>{formatPrice(calculation.costPerUnit)} per {unit}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold">{t.sellingPrice}:</span>
            <span>{formatPrice(calculation.sellingPrice)} per {unit}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold">{t.profitPerUnit}:</span>
            <span>{formatPrice(calculation.profitPerUnit)} per {unit}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold">{t.stockRemaining}:</span>
            <span>{calculation.stockRemaining} {unit}</span>
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <span>{t.dailyProfit}:</span>
            <span>{formatPrice(calculation.dailyProfit)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
