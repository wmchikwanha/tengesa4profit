
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share, Download, History, Save } from 'lucide-react';

interface DailySummaryProps {
  totalProfit: number;
  totalSalesValue: number;
  totalCostValue: number;
  totalStockValue: number;
  viewingHistory: boolean;
  onSharePDF: () => void;
  onDownloadPDF: () => void;
  onToggleHistory: () => void;
  onClearAllData: () => void;
}

export const DailySummary: React.FC<DailySummaryProps> = ({
  totalProfit,
  totalSalesValue,
  totalCostValue,
  totalStockValue,
  viewingHistory,
  onSharePDF,
  onDownloadPDF,
  onToggleHistory,
  onClearAllData,
}) => {
  const { t } = useLanguage();
  const { formatPrice, settings } = useCurrency();

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <Button 
            onClick={onSharePDF}
            variant="outline"
            className="bg-white border-zimbabwe-green text-zimbabwe-darkGreen hover:bg-zimbabwe-lightGreen flex items-center justify-center gap-2"
          >
            <Share className="h-5 w-5" />
            {t.shareTally}
          </Button>
          <Button 
            onClick={onDownloadPDF}
            variant="outline"
            className="bg-white border-zimbabwe-green text-zimbabwe-darkGreen hover:bg-zimbabwe-lightGreen flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            {t.downloadReport}
          </Button>
          <Button 
            onClick={onToggleHistory}
            variant="outline"
            className="bg-white border-zimbabwe-green text-zimbabwe-darkGreen hover:bg-zimbabwe-lightGreen flex items-center justify-center gap-2"
          >
            <History className="h-5 w-5" />
            {viewingHistory ? t.hideHistory : t.viewHistory}
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
