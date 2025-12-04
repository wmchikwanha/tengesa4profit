
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { calculateProduct, Product } from '@/lib/types';

export function useProductForm() {
  const { t } = useLanguage();
  const { products, updateProduct } = useAppData();
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
        quantitySold: selectedProduct.quantitySold + quantitySold,
        quantityDiscarded: selectedProduct.quantityDiscarded + quantityDiscarded
      })
    : null;
  
  const handleSelectProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setSelectedProductId(id);
      // Reset the form inputs to 0 for new sales entry
      setQuantitySold(0);
      setQuantityDiscarded(0);
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
  
  const handleCalculate = async (addToHistoryFn?: (args: { productId: string; soldQty: number; discardedQty: number }) => void | Promise<void>) => {
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
    
    // Check if new sale quantity exceeds remaining stock
    const currentStock = selectedProduct.quantityBought - (selectedProduct.quantitySold + selectedProduct.quantityDiscarded);
    const totalNewQuantity = soldQty + discardedQty;
    
    if (totalNewQuantity > currentStock) {
      if (!window.confirm(t.confirmNegativeStock)) {
        return;
      }
    }
    
    try {
      // Add to existing quantities instead of replacing
      await updateProduct(selectedProductId!, {
        quantitySold: selectedProduct.quantitySold + soldQty,
        quantityDiscarded: selectedProduct.quantityDiscarded + discardedQty
      });
      
      // Automatically save to history after updating the product
      if (addToHistoryFn && (soldQty > 0 || discardedQty > 0)) {
        await addToHistoryFn({ productId: selectedProductId!, soldQty, discardedQty });
      }
      
      // Reset form inputs after successful calculation
      setQuantitySold(0);
      setQuantityDiscarded(0);
      
      toast({
        title: "Success",
        description: "Sale added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive",
      });
    }
  };
  
  return {
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
  };
}
