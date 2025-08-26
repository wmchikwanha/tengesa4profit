
import * as React from 'react';
import { ReportHeader } from './ReportHeader';
import { ReportContent } from './ReportContent';
import { SalesReportDialog } from './SalesReportDialog';
import { useProfitCalculations } from '@/hooks/useProfitCalculations';
import { usePDFReports } from '@/hooks/usePDFReports';
import { useHistoryManagement } from '@/hooks/useHistoryManagement';
import { useSalesReports } from '@/hooks/useSalesReports';
import { useAppData } from '@/contexts/AppDataContext';

const TallyProfit: React.FC = () => {
  const { salesHistory, clearSalesData, addToHistory } = useAppData();
  const { reportRef, handleSharePDF, handleDownloadPDF } = usePDFReports();
  
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
    permissions
  } = useSalesReports(salesHistory, products);
  
  const handleClearData = () => {
    triggerClearAllData(clearSalesData);
  };

  const handleSaveToHistory = () => {
    addToHistory();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <ReportHeader />
        <SalesReportDialog
          products={products}
          onGenerateReport={handleGenerateReport}
          onExportCSV={exportToCSV}
          onShareReport={shareReport}
          generatedReport={generatedReport}
          permissions={permissions}
        />
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
        handleCalculate={handleCalculate}
        handleSharePDF={handleSharePDF}
        handleDownloadPDF={handleDownloadPDF}
        handleToggleHistory={handleToggleHistory}
        handleClearAllData={handleClearData}
        handleSaveToHistory={handleSaveToHistory}
        applyDateFilter={applyDateFilter}
        resetDateFilter={resetDateFilter}
        calculateTotalSalesPerProduct={calculateTotalSalesPerProduct}
      />
    </div>
  );
};

export default TallyProfit;
