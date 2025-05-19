
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { ProductSelector } from './ProductSelector';
import { ProductCalculationForm } from './ProductCalculationForm';
import { CalculationResults } from './CalculationResults';
import { Product } from '@/lib/types';
import { ProductCalculation } from '@/lib/types';

interface MainReportProps {
  products: Product[];
  selectedProduct: Product | null;
  selectedProductId: string | null;
  quantitySold: number | '';
  quantityDiscarded: number | '';
  invalidFields: Set<string>;
  calculation: ProductCalculation | null;
  onSelectProduct: (id: string) => void;
  onQuantitySoldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityDiscardedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCalculate: () => void;
}

export const MainReport: React.FC<MainReportProps> = ({
  products,
  selectedProduct,
  selectedProductId,
  quantitySold,
  quantityDiscarded,
  invalidFields,
  calculation,
  onSelectProduct,
  onQuantitySoldChange,
  onQuantityDiscardedChange,
  onCalculate,
}) => {
  const { t } = useLanguage();
  
  if (products.length === 0) {
    return (
      <Card className="bg-white border border-blue-200">
        <CardContent className="pt-6">
          <p>{t.noProducts}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <ProductSelector
        products={products}
        selectedProductId={selectedProductId}
        onSelectProduct={onSelectProduct}
      />
      
      {selectedProduct && (
        <div className="space-y-4">
          <ProductCalculationForm
            selectedProduct={selectedProduct}
            quantitySold={quantitySold}
            quantityDiscarded={quantityDiscarded}
            invalidFields={invalidFields}
            onQuantitySoldChange={onQuantitySoldChange}
            onQuantityDiscardedChange={onQuantityDiscardedChange}
            onCalculate={onCalculate}
          />
          
          <CalculationResults calculation={calculation} />
        </div>
      )}
    </>
  );
};
