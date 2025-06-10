
import * as React from 'react';
import { SalesRecord } from '@/contexts/AppDataContext';
import { Product, ProductCalculation } from '@/lib/types';
import { MainReport } from './MainReport';
import { DailySummary } from './DailySummary';
import { HistorySection } from './HistorySection';
import { ProductSummary } from './ProductSummary';

interface ReportContentProps {
  reportRef: React.RefObject<HTMLDivElement>;
  products: Product[];
  salesHistory: SalesRecord[];
  filteredHistory: SalesRecord[];
  selectedProduct: Product | null;
  selectedProductId: string | null;
  quantitySold: number | '';
  quantityDiscarded: number | '';
  invalidFields: Set<string>;
  calculation: ProductCalculation | null;
  totalProfit: number;
  totalSalesValue: number;
  totalCostValue: number;
  totalStockValue: number;
  totalDiscardedValue: number;
  totalDiscardedQuantity: number;
  viewingHistory: boolean;
  isDateFilterOpen: boolean;
  setIsDateFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectProduct: (id: string) => void;
  handleQuantitySoldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleQuantityDiscardedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCalculate: () => void;
  handleSharePDF: () => void;
  handleDownloadPDF: () => void;
  handleToggleHistory: () => void;
  handleClearAllData: () => void;
  applyDateFilter: (data: { startDate: Date | undefined; endDate: Date | undefined }) => void;
  resetDateFilter: () => void;
  calculateTotalSalesPerProduct: (productId: string) => {
    totalQuantitySold: number;
    totalQuantityDiscarded: number;
    totalProfit: number;
    totalSalesValue: number;
    totalCostValue: number;
    totalDiscardedValue: number;
  };
}

export const ReportContent: React.FC<ReportContentProps> = ({
  reportRef,
  products,
  salesHistory,
  filteredHistory,
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
  viewingHistory,
  isDateFilterOpen,
  setIsDateFilterOpen,
  handleSelectProduct,
  handleQuantitySoldChange,
  handleQuantityDiscardedChange,
  handleCalculate,
  handleSharePDF,
  handleDownloadPDF,
  handleToggleHistory,
  handleClearAllData,
  applyDateFilter,
  resetDateFilter,
  calculateTotalSalesPerProduct
}) => {
  return (
    <div id="report-content" ref={reportRef}>
      <MainReport
        products={products}
        selectedProduct={selectedProduct}
        selectedProductId={selectedProductId}
        quantitySold={quantitySold}
        quantityDiscarded={quantityDiscarded}
        invalidFields={invalidFields}
        calculation={calculation}
        onSelectProduct={handleSelectProduct}
        onQuantitySoldChange={handleQuantitySoldChange}
        onQuantityDiscardedChange={handleQuantityDiscardedChange}
        onCalculate={handleCalculate}
      />
      
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
        salesHistory={filteredHistory}
        isDateFilterOpen={isDateFilterOpen}
        setIsDateFilterOpen={setIsDateFilterOpen}
        onApplyDateFilter={applyDateFilter}
        onResetDateFilter={resetDateFilter}
      />
      
      <ProductSummary
        products={products}
        salesHistory={salesHistory}
        totalSalesValue={totalSalesValue}
        totalCostValue={totalCostValue}
        totalProfit={totalProfit}
        totalDiscardedValue={totalDiscardedValue}
        totalDiscardedQuantity={totalDiscardedQuantity}
        calculateTotalSalesPerProduct={calculateTotalSalesPerProduct}
      />
    </div>
  );
};
