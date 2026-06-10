
import * as React from 'react';
import { ReportHeader } from './ReportHeader';
import { ReportContent } from './ReportContent';
import { SalesReportDialog } from './SalesReportDialog';
import { useProfitCalculations } from '@/hooks/useProfitCalculations';
import { usePDFReports } from '@/hooks/usePDFReports';
import { useHistoryManagement } from '@/hooks/useHistoryManagement';
import { useSalesReports } from '@/hooks/useSalesReports';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAnalytics } from '@/hooks/useAnalytics';

const TallyProfit: React.FC = () => {
  const { salesHistory, clearSalesData, addToHistory } = useAppData();
  const { reportRef, handleSharePDF, handleDownloadPDF } = usePDFReports();
  const { toast } = useToast();
  const { permissions: businessPermissions } = useBusiness();
  const { trackEvent } = useAnalytics();
  const [saleDate, setSaleDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  
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
    totalDiscardedValue,
    totalDiscardedQuantity,
    handleSelectProduct,
    handleQuantitySoldChange,
    handleQuantityDiscardedChange,
    handleCalculate,
    calculateTotalSalesPerProduct
  } = useProfitCalculations();
  
  const {
    viewingHistory,
    filteredHistory,
    isDateFilterOpen,
    setIsDateFilterOpen,
    handleToggleHistory,
    handleClearAllData: triggerClearAllData,
    applyDateFilter,
    resetDateFilter
  } = useHistoryManagement(salesHistory);

  // Sales reports
  const {
    handleGenerateReport,
    exportToCSV,
    shareReport,
    generatedReport,
    permissions: reportPermissions
  } = useSalesReports(salesHistory, products);
  
  const handleClearAllData = async () => {
    if (window.confirm("Are you sure you want to clear all data? This will delete all products and sales history.")) {
      await clearSalesData();
      toast({
        title: "Success",
        description: "All data has been cleared",
      });
    }
  };

  const handleAddSale = async () => {
    await handleCalculate(async ({ productId, soldQty, discardedQty }) => {
      await addToHistory(saleDate, productId, soldQty, discardedQty);
      trackEvent('sale_recorded', {
        productId,
        quantitySold: soldQty,
        quantityDiscarded: discardedQty,
      });
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <ReportHeader />
        {businessPermissions.canAccessReports && (
          <SalesReportDialog
            products={products}
            onGenerateReport={handleGenerateReport}
            onExportCSV={exportToCSV}
            onShareReport={shareReport}
            generatedReport={generatedReport}
            permissions={reportPermissions}
          />
        )}
      </div>
      
      <ReportContent
        reportRef={reportRef}
        products={products}
        salesHistory={salesHistory}
        filteredHistory={filteredHistory}
        selectedProduct={selectedProduct}
        selectedProductId={selectedProductId}
        quantitySold={quantitySold}
        quantityDiscarded={quantityDiscarded}
        invalidFields={invalidFields}
        calculation={calculation}
        totalProfit={totalProfit}
        totalSalesValue={totalSalesValue}
        totalCostValue={totalCostValue}
        totalStockValue={totalStockValue}
        totalDiscardedValue={totalDiscardedValue}
        totalDiscardedQuantity={totalDiscardedQuantity}
        viewingHistory={viewingHistory}
        isDateFilterOpen={isDateFilterOpen}
        setIsDateFilterOpen={setIsDateFilterOpen}
        handleSelectProduct={handleSelectProduct}
        handleQuantitySoldChange={handleQuantitySoldChange}
        handleQuantityDiscardedChange={handleQuantityDiscardedChange}
        handleCalculate={handleAddSale}
        handleSharePDF={handleSharePDF}
        handleDownloadPDF={handleDownloadPDF}
        handleToggleHistory={handleToggleHistory}
        handleClearAllData={handleClearAllData}
        applyDateFilter={applyDateFilter}
        resetDateFilter={resetDateFilter}
        calculateTotalSalesPerProduct={calculateTotalSalesPerProduct}
        saleDate={saleDate}
        setSaleDate={setSaleDate}
      />
    </div>
  );
};

export default TallyProfit;
