
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { calculateProduct, Product } from '@/lib/types';

export function useProfitCalculations() {
  const { t } = useLanguage();
  const { products, salesHistory, updateProduct } = useAppData();
  const { toast } = useToast();
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantitySold, setQuantitySold] = useState<number | ''>(0);
  const [quantityDiscarded, setQuantityDiscarded] = useState<number | ''>(0);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  
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
  
  // Calculate total sales per product across all history
  const calculateTotalSalesPerProduct = (productId: string) => {
    let totalQuantitySold = 0;
    let totalProfit = 0;
    let totalSalesValue = 0;
    let totalCostValue = 0;
    
    // Calculate from current products
    const product = products.find(p => p.id === productId);
    if (product) {
      const calc = calculateProduct(product);
      totalQuantitySold += product.quantitySold || 0;
      totalProfit += calc.dailyProfit;
      totalSalesValue += product.quantitySold * product.sellingPrice;
      totalCostValue += product.quantitySold * calc.costPerUnit;
    }
    
    // Add from history too if available
    salesHistory.forEach(record => {
      const historyProduct = record.products.find(p => p.id === productId);
      if (historyProduct) {
        const calc = calculateProduct(historyProduct);
        totalQuantitySold += historyProduct.quantitySold || 0;
        totalProfit += calc.dailyProfit;
        totalSalesValue += historyProduct.quantitySold * historyProduct.sellingPrice;
        totalCostValue += historyProduct.quantitySold * calc.costPerUnit;
      }
    });
    
    return { totalQuantitySold, totalProfit, totalSalesValue, totalCostValue };
  };
  
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
    handleSelectProduct,
    handleQuantitySoldChange,
    handleQuantityDiscardedChange,
    handleCalculate,
    calculateTotalSalesPerProduct
  };
}
