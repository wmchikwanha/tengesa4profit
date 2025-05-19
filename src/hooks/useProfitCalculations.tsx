
import { useProductForm } from '@/hooks/useProductForm';
import { useProductCalculations } from '@/hooks/useProductCalculations';
import { useAppData } from '@/contexts/AppDataContext';

export function useProfitCalculations() {
  const { products } = useAppData();
  
  const {
    selectedProduct,
    selectedProductId,
    quantitySold,
    quantityDiscarded,
    invalidFields,
    calculation,
    handleSelectProduct,
    handleQuantitySoldChange,
    handleQuantityDiscardedChange,
    handleCalculate,
  } = useProductForm();
  
  const {
    totalProfit,
    totalSalesValue,
    totalCostValue,
    totalStockValue,
    totalDiscardedValue,
    totalDiscardedQuantity,
    calculateTotalSalesPerProduct
  } = useProductCalculations();
  
  return {
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
  };
}
