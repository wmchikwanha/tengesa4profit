
import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { downloadPDF, sharePDF } from '@/utils/pdfUtils';
import { calculateProduct } from '@/lib/types';
import { CalendarIcon } from 'lucide-react';
import { ProductSelector } from './ProductSelector';
import { ProductCalculationForm } from './ProductCalculationForm';
import { CalculationResults } from './CalculationResults';
import { DailySummary } from './DailySummary';
import { HistorySection } from './HistorySection';
import { ProductSummary } from './ProductSummary';

const TallyProfit: React.FC = () => {
  const { t } = useLanguage();
  const { products, salesHistory, updateProduct, clearAllData } = useAppData();
  const { toast } = useToast();
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantitySold, setQuantitySold] = useState<number | ''>(0);
  const [quantityDiscarded, setQuantityDiscarded] = useState<number | ''>(0);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  
  const reportRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  
  const selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId)
    : null;
  
  const calculation = selectedProduct && typeof quantitySold === 'number' && typeof quantityDiscarded === 'number'
    ? calculateProduct({
        ...selectedProduct,
        quantitySold,
        quantityDiscarded
      })
    : null;
  
  const handleSelectProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setSelectedProductId(id);
      setQuantitySold(product.quantitySold || 0);
      setQuantityDiscarded(product.quantityDiscarded || 0);
      setInvalidFields(new Set());
    }
  };
  
  const handleQuantitySoldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantitySold(value === '' ? '' : Number(value));
    
    // Clear validation error
    if (value !== '') {
      setInvalidFields(prev => {
        const updated = new Set(prev);
        updated.delete('quantitySold');
        return updated;
      });
    }
  };
  
  const handleQuantityDiscardedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantityDiscarded(value === '' ? '' : Number(value));
  };
  
  const validateForm = (): boolean => {
    if (!selectedProduct) return false;
    
    const newInvalidFields = new Set<string>();
    const soldQty = typeof quantitySold === 'number' ? quantitySold : 0;
    
    if (soldQty < 0) {
      newInvalidFields.add('quantitySold');
    }
    
    setInvalidFields(newInvalidFields);
    return newInvalidFields.size === 0;
  };
  
  const handleCalculate = () => {
    if (!selectedProduct) return;
    
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fix the highlighted fields",
        variant: "destructive",
      });
      return;
    }
    
    const soldQty = typeof quantitySold === 'number' ? quantitySold : 0;
    const discardedQty = typeof quantityDiscarded === 'number' ? quantityDiscarded : 0;
    
    if (soldQty + discardedQty > selectedProduct.quantityBought) {
      toast({
        title: "Error",
        description: "Total quantity cannot exceed quantity bought",
        variant: "destructive",
      });
      return;
    }
    
    // Save updated values
    updateProduct(selectedProductId!, {
      quantitySold: soldQty,
      quantityDiscarded: discardedQty
    });
    
    toast({
      title: "Success",
      description: "Calculation complete",
    });
  };

  // Calculate total profit across all products
  const totalProfit = products.reduce((sum, product) => {
    const calc = calculateProduct(product);
    return sum + calc.dailyProfit;
  }, 0);
  
  // Calculate total remaining stock value
  const totalStockValue = products.reduce((sum, product) => {
    const calc = calculateProduct(product);
    return sum + (calc.stockRemaining * calc.sellingPrice);
  }, 0);
  
  // Calculate total sales value
  const totalSalesValue = products.reduce((sum, product) => {
    return sum + (product.quantitySold * product.sellingPrice);
  }, 0);
  
  // Calculate total cost value
  const totalCostValue = products.reduce((sum, product) => {
    const calc = calculateProduct(product);
    return sum + (product.quantitySold * calc.costPerUnit);
  }, 0);
  
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
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TallyProfit;
