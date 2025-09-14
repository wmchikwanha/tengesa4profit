
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/lib/types';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProductCalculationFormProps {
  selectedProduct: Product;
  quantitySold: number | '';
  quantityDiscarded: number | '';
  invalidFields: Set<string>;
  onQuantitySoldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityDiscardedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCalculate: () => void;
}

export const ProductCalculationForm: React.FC<ProductCalculationFormProps> = ({
  selectedProduct,
  quantitySold,
  quantityDiscarded,
  invalidFields,
  onQuantitySoldChange,
  onQuantityDiscardedChange,
  onCalculate,
}) => {
  const { t } = useLanguage();

  const unit = selectedProduct.unitOfMeasurement;

  return (
    <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
        <p className="text-sm text-gray-600">
          Available: {selectedProduct.quantityBought - (selectedProduct.quantitySold + selectedProduct.quantityDiscarded)} {unit}
        </p>
        
        <div>
          <div className="flex items-center gap-1 mb-1">
            <label htmlFor="quantitySold" className="trader-label">{t.quantitySold} ({unit})</label>
            <span className="text-red-500">*</span>
            {invalidFields.has('quantitySold') && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <Input
            id="quantitySold"
            value={quantitySold}
            onChange={onQuantitySoldChange}
            type="number"
            min="0"
            max={Math.max(0, selectedProduct.quantityBought - (selectedProduct.quantitySold + selectedProduct.quantityDiscarded))}
            className={`trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen ${invalidFields.has('quantitySold') ? 'border-red-500' : ''}`}
          />
        </div>
        
        <div>
          <label htmlFor="quantityDiscarded" className="trader-label">
            {t.quantityDiscarded} ({unit}) <span className="text-sm text-trader-neutral">({t.optional})</span>
          </label>
          <Input
            id="quantityDiscarded"
            value={quantityDiscarded}
            onChange={onQuantityDiscardedChange}
            type="number"
            min="0"
            max={selectedProduct.quantityBought - (typeof quantitySold === 'number' ? quantitySold : 0)}
            className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
          />
        </div>
        
        <Button 
          onClick={onCalculate}
          className="trader-btn-accent w-full bg-zimbabwe-darkGreen hover:bg-zimbabwe-green text-white"
        >
          Add Sale
        </Button>
      </CardContent>
    </Card>
  );
};
