
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useSubscriptionPermissions } from '@/hooks/useSubscriptionPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share, Download, History, Save } from 'lucide-react';

interface DailySummaryProps {
  totalProfit: number;
  totalSalesValue: number;
  totalCostValue: number;
  totalStockValue: number;
  totalDiscardedValue: number;
  totalDiscardedQuantity: number;
  viewingHistory: boolean;
  onSharePDF: () => void;
  onDownloadPDF: () => void;  
  onToggleHistory: () => void;
  onClearAllData: () => void;
  onSaveToHistory: () => void;
}

export const DailySummary: React.FC<DailySummaryProps> = ({
  totalProfit,
  totalSalesValue,
  totalCostValue,
  totalStockValue,
  totalDiscardedValue,
  totalDiscardedQuantity,
  viewingHistory,
  onSharePDF,
  onDownloadPDF,
  onToggleHistory,
  onClearAllData,
  onSaveToHistory,
}) => {
  const { t } = useLanguage();
  const { formatPrice, settings } = useCurrency();
  const permissions = useSubscriptionPermissions();

  const displayRate = settings.currentCurrency === 'USD' ? 1 : settings.exchangeRate;

  return (
    <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-zimbabwe-darkGreen">{t.dailySummary}</CardTitle>
          <div className="text-zimbabwe-darkGreen font-semibold">
            Rate: {displayRate.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between font-bold text-xl">
          <span>{t.totalProfit}:</span>
          <span>{formatPrice(totalProfit)}</span>
        </div>
        
        <div className="flex justify-between text-lg">
          <span>{t.totalSalesValue}:</span>
          <span>{formatPrice(totalSalesValue)}</span>
        </div>

        <div className="flex justify-between text-lg">
          <span>{t.totalCostValue}:</span>
          <span>{formatPrice(totalCostValue)}</span>
        </div>
        
        <div className="flex justify-between text-lg">
          <span>{t.totalStockRemaining}:</span>
          <span>{formatPrice(totalStockValue)}</span>
        </div>

        <div className="flex justify-between text-lg">
          <span>Total Discarded Value:</span>
          <span>{formatPrice(totalDiscardedValue)}</span>
        </div>

        <div className="flex justify-between text-lg">
          <span>Total Discarded Quantity:</span>
          <span>{totalDiscardedQuantity}</span>
        </div>
        
        <div className="flex justify-center gap-4 mt-4">
          <Button 
            onClick={onSaveToHistory}
            variant="default"
            className="bg-zimbabwe-green hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            Save to History
          </Button>
          <Button 
            onClick={onClearAllData}
            variant="destructive"
            className="bg-zimbabwe-red hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {t.clearAllData}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
