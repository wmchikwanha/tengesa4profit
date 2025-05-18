
import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { downloadPDF, sharePDF } from '@/utils/pdfUtils';
import { CalendarIcon } from 'lucide-react';
import { ProductSelector } from './ProductSelector';
import { ProductCalculationForm } from './ProductCalculationForm';
import { CalculationResults } from './CalculationResults';
import { DailySummary } from './DailySummary';
import { HistorySection } from './HistorySection';
import { ProductSummary } from './ProductSummary';
import { useProfitCalculations } from '@/hooks/useProfitCalculations';

const TallyProfit: React.FC = () => {
  const { t } = useLanguage();
  const { salesHistory, clearAllData } = useAppData();
  const { toast } = useToast();
  const [viewingHistory, setViewingHistory] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);
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
  
  const handleSharePDF = async () => {
    try {
      toast({
        title: "Share",
        description: "Generating PDF for sharing...",
      });
      
      if (reportRef.current) {
        await sharePDF('report-content', `trader-profit-report-${format(today, 'yyyy-MM-dd')}.pdf`);
        
        toast({
          title: "Success",
          description: "Report shared successfully",
        });
      } else {
        throw new Error("Report content not found");
      }
    } catch (error) {
      console.error("Share PDF error:", error);
      
      // Even if there's an error, try to use the Web Share API directly if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Zim Market Trader - Daily Report',
            text: `Daily sales report for ${format(today, 'PPP')}. Total profit: ${t.currency}${totalProfit.toFixed(2)}`,
          });
          
          toast({
            title: "Success",
            description: "Shared successfully",
          });
          return;
        } catch (shareError) {
          console.error("Share API error:", shareError);
        }
      }
      
      toast({
        title: "Warning",
        description: "Could not generate report, but sharing options will appear",
      });
    }
  };
  
  const handleDownloadPDF = async () => {
    try {
      toast({
        title: "Download",
        description: "Downloading PDF report...",
      });
      
      if (reportRef.current) {
        await downloadPDF('report-content', `trader-profit-report-${format(today, 'yyyy-MM-dd')}.pdf`);
        
        toast({
          title: "Success",
          description: "Report downloaded successfully",
        });
      } else {
        throw new Error("Report content not found");
      }
    } catch (error) {
      console.error("Download PDF error:", error);
      toast({
        title: "Error",
        description: "Could not generate or download the report",
        variant: "destructive",
      });
    }
  };
  
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
