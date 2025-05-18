
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductCalculation } from '@/lib/types';
import { AlertCircle as AlertIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CalculationResultsProps {
  calculation: ProductCalculation | null;
}

export const CalculationResults: React.FC<CalculationResultsProps> = ({ calculation }) => {
  const { t } = useLanguage();

  if (!calculation) return null;

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
            <span>{t.currency}{calculation.costPerUnit.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold">{t.sellingPrice}:</span>
            <span>{t.currency}{calculation.sellingPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold">{t.profitPerUnit}:</span>
            <span>{t.currency}{calculation.profitPerUnit.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold">{t.stockRemaining}:</span>
            <span>{calculation.stockRemaining}</span>
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <span>{t.dailyProfit}:</span>
            <span>{t.currency}{calculation.dailyProfit.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
