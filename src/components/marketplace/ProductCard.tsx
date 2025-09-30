
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
        {/* Mobile-friendly stacked layout */}
        <div className="flex flex-col gap-3">
          {/* Header Row: Name and Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold break-words text-base">{product.name}</h4>
              <p className="text-sm text-gray-600 break-words mt-1">{product.description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {canListProducts && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(product)}
                  className="h-9 w-9 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 block mb-1">Category</span>
              <span className="break-words">{getCategoryTranslation(product.category, t)}</span>
            </div>
            
            <div>
              <span className="text-gray-500 block mb-1">Brand</span>
              <span className="break-words">{product.brand || '-'}</span>
            </div>
            
            <div>
              <span className="text-gray-500 block mb-1">Price/Unit</span>
              <span className="font-medium">
                {getCurrencySymbol()} {convertPrice(product.price).toFixed(2)}/{product.unit}
              </span>
            </div>
            
            <div>
              <span className="text-gray-500 block mb-1">Status</span>
              <div>
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
