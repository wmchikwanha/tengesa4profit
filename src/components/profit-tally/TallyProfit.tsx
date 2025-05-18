
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { ProductSelector } from './ProductSelector';
import { ProductCalculationForm } from './ProductCalculationForm';
import { CalculationResults } from './CalculationResults';
import { DailySummary } from './DailySummary';
import { HistorySection } from './HistorySection';
import { ProductSummary } from './ProductSummary';
import { useProfitCalculations } from '@/hooks/useProfitCalculations';
import { usePDFReports } from '@/hooks/usePDFReports';

const TallyProfit: React.FC = () => {
  const { t } = useLanguage();
  const { salesHistory, clearAllData } = useAppData();
  const { toast } = useToast();
  const [viewingHistory, setViewingHistory] = useState(false);
  const { reportRef, handleSharePDF, handleDownloadPDF } = usePDFReports();
  const today = new Date();
  
  const {
    products,
    selectedProduct,
    selectedProductId,
    quantitySold,
    quantityDiscarded,
    invalidFields,
    calculation,
    totalProfit,
    totalSalesValue,
    totalCostValue,
    totalStockValue,
    handleSelectProduct,
    handleQuantitySoldChange,
    handleQuantityDiscardedChange,
    handleCalculate,
    calculateTotalSalesPerProduct
  } = useProfitCalculations();
  
  const handleClearAllData = () => {
    if (window.confirm(t.confirmClearAll)) {
      clearAllData();
      toast({
        title: "Success",
        description: "All data has been cleared",
      });
    }
  };
  
  const handleToggleHistory = () => {
    setViewingHistory(!viewingHistory);
  };
  
  return (
    <div className="space-y-6">
      {/* Date Display */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-700">{t.tallyProfit}</h2>
        <div className="flex items-center gap-2 text-blue-600">
          <CalendarIcon className="h-5 w-5" />
          <span>{format(today, 'PPP')}</span>
        </div>
      </div>
      
      {/* Report Content Wrapper - This div will be used for PDF generation */}
      <div id="report-content" ref={reportRef}>
        {products.length === 0 ? (
          <Card className="bg-white border border-blue-200">
            <CardContent className="pt-6">
              <p>{t.noProducts}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <ProductSelector
              products={products}
              selectedProductId={selectedProductId}
              onSelectProduct={handleSelectProduct}
            />
            
            {selectedProduct && (
              <div className="space-y-4">
                <ProductCalculationForm
                  selectedProduct={selectedProduct}
                  quantitySold={quantitySold}
                  quantityDiscarded={quantityDiscarded}
                  invalidFields={invalidFields}
                  onQuantitySoldChange={handleQuantitySoldChange}
                  onQuantityDiscardedChange={handleQuantityDiscardedChange}
                  onCalculate={handleCalculate}
                />
                
                <CalculationResults calculation={calculation} />
              </div>
            )}
            
            <DailySummary
              totalProfit={totalProfit}
              totalSalesValue={totalSalesValue}
              totalCostValue={totalCostValue}
              totalStockValue={totalStockValue}
              viewingHistory={viewingHistory}
              onSharePDF={handleSharePDF}
              onDownloadPDF={handleDownloadPDF}
              onToggleHistory={handleToggleHistory}
              onClearAllData={handleClearAllData}
            />
            
            <HistorySection 
              viewingHistory={viewingHistory}
              salesHistory={salesHistory}
            />
            
            <ProductSummary
              products={products}
              salesHistory={salesHistory}
              totalSalesValue={totalSalesValue}
              totalCostValue={totalCostValue}
              totalProfit={totalProfit}
              calculateTotalSalesPerProduct={calculateTotalSalesPerProduct}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TallyProfit;
