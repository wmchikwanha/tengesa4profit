
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string | null;
  onSelectProduct: (id: string) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProductId,
  onSelectProduct,
}) => {
  const { t } = useLanguage();

  return (
    <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <label htmlFor="productSelect" className="trader-label">
            {t.selectProduct}
          </label>
          <Select value={selectedProductId || ''} onValueChange={onSelectProduct}>
            <SelectTrigger id="productSelect" className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen">
              <SelectValue placeholder={t.selectProduct} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-zimbabwe-green shadow-lg">
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id} className="hover:bg-zimbabwe-lightGreen">
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-gray-600">Supplier: {product.supplier}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
