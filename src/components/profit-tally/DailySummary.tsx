
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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

  return (
    <Card className="bg-blue-100 border border-blue-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-blue-800">{t.dailySummary}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between font-bold text-xl">
          <span>{t.totalProfit}:</span>
          <span>{t.currency}{totalProfit.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-lg">
          <span>{t.totalSalesValue}:</span>
          <span>{t.currency}{totalSalesValue.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-lg">
          <span>{t.totalCostValue}:</span>
          <span>{t.currency}{totalCostValue.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-lg">
          <span>{t.totalStockValue}:</span>
          <span>{t.currency}{totalStockValue.toFixed(2)}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <Button 
            onClick={onSharePDF}
            variant="outline"
            className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            <Share className="h-5 w-5" />
            {t.shareTally}
          </Button>
          <Button 
            onClick={onDownloadPDF}
            variant="outline"
            className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            {t.downloadReport}
          </Button>
          <Button 
            onClick={onToggleHistory}
            variant="outline"
            className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            <History className="h-5 w-5" />
            {viewingHistory ? t.hideHistory : t.viewHistory}
          </Button>
          <Button 
            onClick={onClearAllData}
            variant="destructive"
            className="flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {t.clearAllData}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
