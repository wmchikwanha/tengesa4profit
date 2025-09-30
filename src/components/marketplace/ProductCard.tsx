
import * as React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionPermissions } from '@/hooks/useSubscriptionPermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { PRODUCT_CATEGORIES, type MarketplaceProduct } from '@/lib/marketplace-types';
import { getCategoryTranslation } from '@/lib/categoryTranslations';

interface ProductCardProps {
  product: MarketplaceProduct;
  onEdit: (product: MarketplaceProduct) => void;
  onDelete: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const { convertPrice, getCurrencySymbol } = useCurrency();
  const { t } = useLanguage();
  const { canListProducts } = useSubscriptionPermissions();

  const handleDelete = () => {
    if (confirm(t.deleteWarning || 'Are you sure you want to delete this product?')) {
      onDelete(product.id);
    }
  };

  return (
    <Card className="border-zimbabwe-green">
      <CardContent className="p-4">
        {/* Grid layout matching the headers */}
        <div className="grid grid-cols-12 gap-2 items-center">
          {/* Product Name - 3 cols */}
          <div className="col-span-3">
            <h4 className="font-semibold break-words text-sm">{product.name}</h4>
            <p className="text-xs text-gray-600 break-words line-clamp-2">{product.description}</p>
          </div>
          
          {/* Category - 2 cols */}
          <div className="col-span-2">
            <span className="text-sm break-words">{getCategoryTranslation(product.category, t)}</span>
          </div>
          
          {/* Brand - 2 cols */}
          <div className="col-span-2">
            <span className="text-sm break-words">{product.brand || '-'}</span>
          </div>
          
          {/* Price/Unit - 2 cols */}
          <div className="col-span-2">
            <span className="font-medium text-sm">
              {getCurrencySymbol()} {convertPrice(product.price).toFixed(2)}/{product.unit}
            </span>
          </div>
          
          {/* Status - 2 cols */}
          <div className="col-span-2">
            <Badge variant={
              !canListProducts ? 'destructive' : 
              product.isPubliclyVisible ? 'default' : 'secondary'
            } className="text-xs">
              {!canListProducts ? 'Delisted' : 
               product.isPubliclyVisible ? 'Public' : 'Private'}
            </Badge>
            {!canListProducts && (
              <p className="text-xs text-red-500 mt-1">
                Upgrade to re-list
              </p>
            )}
          </div>
          
          {/* Actions - 1 col */}
          <div className="col-span-1 flex gap-1 justify-end">
            {canListProducts && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(product)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
