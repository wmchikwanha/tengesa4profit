
import * as React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { PRODUCT_CATEGORIES, type MarketplaceProduct } from '@/lib/marketplace-types';

interface ProductCardProps {
  product: MarketplaceProduct;
  onEdit: (product: MarketplaceProduct) => void;
  onDelete: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const { convertPrice, getCurrencySymbol } = useCurrency();
  const { t } = useLanguage();

  const handleDelete = () => {
    if (confirm(t.deleteWarning || 'Are you sure you want to delete this product?')) {
      onDelete(product.id);
    }
  };

  return (
    <Card className="border-zimbabwe-green">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h4 className="font-semibold break-words">{product.name}</h4>
              <Badge variant={product.isPubliclyVisible ? "default" : "secondary"}>
                {product.isPubliclyVisible ? "Public" : "Private"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2 break-words">{product.description}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="font-medium">
                {getCurrencySymbol()} {convertPrice(product.price).toFixed(2)}/{product.unit}
              </span>
              <span className="text-gray-500">•</span>
              <span className="break-words">{PRODUCT_CATEGORIES[product.category]}</span>
              {product.brand && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="break-words">{product.brand}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(product)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
