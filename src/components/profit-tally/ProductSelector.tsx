
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/lib/types';
import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

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
    <Card className="bg-white border border-blue-200">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="product-select" className="trader-label">{t.productName}</label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                  <Info className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-blue-50 border border-blue-200 max-w-[250px]">
                <p>{t.tallyInstructions}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Select value={selectedProductId || ''} onValueChange={onSelectProduct}>
          <SelectTrigger className="border-blue-200 focus:border-blue-400">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map(product => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
