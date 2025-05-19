
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
    return sum + (calc.stockRemaining * product.sellingPrice);
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
  
  // Calculate total discarded value
  const totalDiscardedValue = products.reduce((sum, product) => {
    return sum + (product.quantityDiscarded * product.sellingPrice);
  }, 0);
  
  // Calculate total discarded quantity
  const totalDiscardedQuantity = products.reduce((sum, product) => {
    return sum + (product.quantityDiscarded || 0);
  }, 0);
  
  // Calculate total sales per product across all history
  const calculateTotalSalesPerProduct = (productId: string) => {
    let totalQuantitySold = 0;
    let totalQuantityDiscarded = 0;
    let totalProfit = 0;
    let totalSalesValue = 0;
    let totalCostValue = 0;
    let totalDiscardedValue = 0;
    
    // Calculate from current products
    const product = products.find(p => p.id === productId);
    if (product) {
      const calc = calculateProduct(product);
      totalQuantitySold += product.quantitySold || 0;
      totalQuantityDiscarded += product.quantityDiscarded || 0;
      totalProfit += calc.dailyProfit;
      totalSalesValue += product.quantitySold * product.sellingPrice;
      totalCostValue += product.quantitySold * calc.costPerUnit;
      totalDiscardedValue += product.quantityDiscarded * product.sellingPrice;
    }
    
    // Add from history too if available
    salesHistory.forEach(record => {
      const historyProduct = record.products.find(p => p.id === productId);
      if (historyProduct) {
        const calc = calculateProduct(historyProduct);
        totalQuantitySold += historyProduct.quantitySold || 0;
        totalQuantityDiscarded += historyProduct.quantityDiscarded || 0;
        totalProfit += calc.dailyProfit;
        totalSalesValue += historyProduct.quantitySold * historyProduct.sellingPrice;
        totalCostValue += historyProduct.quantitySold * calc.costPerUnit;
        totalDiscardedValue += historyProduct.quantityDiscarded * historyProduct.sellingPrice;
      }
    });
    
    return { 
      totalQuantitySold, 
      totalQuantityDiscarded, 
      totalProfit, 
      totalSalesValue, 
      totalCostValue, 
      totalDiscardedValue 
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
