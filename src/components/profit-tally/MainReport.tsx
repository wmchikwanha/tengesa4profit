
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  const [saleDate, setSaleDate] = React.useState(new Date().toISOString().split('T')[0]);
  
  if (products.length === 0) {
    return (
      <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
        <CardContent className="pt-6">
          <p>{t.noProducts}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
        <CardContent className="pt-6">
          <div className="mb-4">
            <label htmlFor="saleDate" className="trader-label">{t.dateOfSale}</label>
            <Input
              id="saleDate"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              type="date"
              className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
            />
          </div>
        </CardContent>
      </Card>

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
          
          <CalculationResults calculation={calculation} product={selectedProduct} />
        </div>
      )}
    </>
  );
};
