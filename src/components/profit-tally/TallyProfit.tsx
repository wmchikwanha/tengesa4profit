
import * as React from 'react';
import { ReportHeader } from './ReportHeader';
import { ReportContent } from './ReportContent';
import { useProfitCalculations } from '@/hooks/useProfitCalculations';
import { usePDFReports } from '@/hooks/usePDFReports';
import { useHistoryManagement } from '@/hooks/useHistoryManagement';
import { useAppData } from '@/contexts/AppDataContext';

const TallyProfit: React.FC = () => {
  const { salesHistory, clearSalesData } = useAppData();
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
  
  const handleClearData = () => {
    triggerClearAllData(clearSalesData);
  };
  
  return (
    <div className="space-y-6">
      <ReportHeader />
      
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
        applyDateFilter={applyDateFilter}
        resetDateFilter={resetDateFilter}
        calculateTotalSalesPerProduct={calculateTotalSalesPerProduct}
      />
    </div>
  );
};

export default TallyProfit;
