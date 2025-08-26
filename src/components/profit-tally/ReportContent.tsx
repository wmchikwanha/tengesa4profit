
import * as React from 'react';
import { MainReport } from './MainReport';
import { DailySummary } from './DailySummary';
import { ProductSummary } from './ProductSummary';
import { HistorySection } from './HistorySection';
import ProductsTable from '../ProductsTable';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionPermissions } from '@/hooks/useSubscriptionPermissions';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { Product, ProductCalculation } from '@/lib/types';

interface SalesHistoryRecord {
  date: string;
  totalProfit: number;
  products: Product[];
}

interface DateFilterForm {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

interface ReportContentProps {
  reportRef: React.RefObject<HTMLDivElement>;
  products: Product[];
  salesHistory: SalesHistoryRecord[];
  filteredHistory: SalesHistoryRecord[];
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
  setIsDateFilterOpen: (isOpen: boolean) => void;
  handleSelectProduct: (id: string) => void;
  handleQuantitySoldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleQuantityDiscardedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCalculate: () => void;
  handleSharePDF: () => void;
  handleDownloadPDF: () => void;
  handleToggleHistory: () => void;
  handleClearAllData: () => void;
  handleSaveToHistory: () => void;
  applyDateFilter: (data: DateFilterForm) => void;
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

export const ReportContent: React.FC<ReportContentProps> = (props) => {
  const { t } = useLanguage();
  
  return (
    <div ref={props.reportRef} id="report-content" data-report-content className="space-y-6">
      <MainReport
        products={props.products}
        selectedProduct={props.selectedProduct}
        selectedProductId={props.selectedProductId}
        quantitySold={props.quantitySold}
        quantityDiscarded={props.quantityDiscarded}
        invalidFields={props.invalidFields}
        calculation={props.calculation}
        onSelectProduct={props.handleSelectProduct}
        onQuantitySoldChange={props.handleQuantitySoldChange}
        onQuantityDiscardedChange={props.handleQuantityDiscardedChange}
        onCalculate={props.handleCalculate}
      />
      
      <DailySummary
        totalProfit={props.totalProfit}
        totalSalesValue={props.totalSalesValue}
        totalCostValue={props.totalCostValue}
        totalStockValue={props.totalStockValue}
        totalDiscardedValue={props.totalDiscardedValue}
        totalDiscardedQuantity={props.totalDiscardedQuantity}
        onSharePDF={props.handleSharePDF}
        onDownloadPDF={props.handleDownloadPDF}
        onToggleHistory={props.handleToggleHistory}
        onClearAllData={props.handleClearAllData}
        onSaveToHistory={props.handleSaveToHistory}
        viewingHistory={props.viewingHistory}
      />
      
      <div className="max-h-96 overflow-y-auto">
        <ProductSummary
          products={props.products}
          salesHistory={props.salesHistory}
          totalSalesValue={props.totalSalesValue}
          totalCostValue={props.totalCostValue}
          totalProfit={props.totalProfit}
          totalDiscardedValue={props.totalDiscardedValue}
          totalDiscardedQuantity={props.totalDiscardedQuantity}
          calculateTotalSalesPerProduct={props.calculateTotalSalesPerProduct}
        />
      </div>
      
      {/* Read-only Products List for Sales Page */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-zimbabwe-darkGreen">{t.productsList}</h3>
        <div className="max-h-96 overflow-y-auto">
          <ProductsTable
            products={props.products}
            onEditProduct={() => {}} // No-op for read-only
            onDeleteProduct={() => {}} // No-op for read-only
            showTitle={false}
          />
        </div>
      </div>
      
      {/* History Toggle Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={props.handleToggleHistory}
          className="border-zimbabwe-green text-zimbabwe-darkGreen hover:bg-zimbabwe-lightGreen"
        >
          {props.viewingHistory ? t.hideHistory : t.viewHistory}
        </Button>
      </div>
      
      <HistorySection
        viewingHistory={props.viewingHistory}
        salesHistory={props.filteredHistory}
        isDateFilterOpen={props.isDateFilterOpen}
        setIsDateFilterOpen={props.setIsDateFilterOpen}
        onApplyDateFilter={props.applyDateFilter}
        onResetDateFilter={props.resetDateFilter}
      />
    </div>
  );
};
