
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { calculateProduct } from '@/lib/types';

export function useProductCalculations() {
  const { products, salesHistory } = useAppData();
  const { t } = useLanguage();
  
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
    const calc = calculateProduct(product);
    return sum + (product.quantitySold * calc.sellingPrice);
  }, 0);
  
  // Calculate total cost value
  const totalCostValue = products.reduce((sum, product) => {
    const calc = calculateProduct(product);
    return sum + (product.quantitySold * calc.costPerUnit);
  }, 0);
  
  // Calculate total discarded value
  const totalDiscardedValue = products.reduce((sum, product) => {
    const calc = calculateProduct(product);
    return sum + (product.quantityDiscarded * calc.sellingPrice);
  }, 0);
  
  // Calculate total discarded quantity
  const totalDiscardedQuantity = products.reduce((sum, product) => {
    return sum + (product.quantityDiscarded || 0);
  }, 0);
  
  // Calculate total sales per product from current data only (not double counting history)
  const calculateTotalSalesPerProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return { 
        totalQuantitySold: 0, 
        totalQuantityDiscarded: 0, 
        totalProfit: 0, 
        totalSalesValue: 0, 
        totalCostValue: 0, 
        totalDiscardedValue: 0 
      };
    }

    const calc = calculateProduct(product);
    return { 
      totalQuantitySold: product.quantitySold || 0,
      totalQuantityDiscarded: product.quantityDiscarded || 0, 
      totalProfit: calc.dailyProfit,
      totalSalesValue: product.quantitySold * calc.sellingPrice,
      totalCostValue: product.quantitySold * calc.costPerUnit,
      totalDiscardedValue: product.quantityDiscarded * calc.sellingPrice
    };
  };
  
  return {
    totalProfit,
    totalSalesValue,
    totalCostValue,
    totalStockValue,
    totalDiscardedValue,
    totalDiscardedQuantity,
    calculateTotalSalesPerProduct
  };
}
