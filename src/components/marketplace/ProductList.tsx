
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionPermissions } from '@/hooks/useSubscriptionPermissions';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from './ProductCard';
import { type MarketplaceProduct } from '@/lib/marketplace-types';

interface ProductListProps {
  products: MarketplaceProduct[];
  onEdit: (product: MarketplaceProduct) => void;
  onDelete: (productId: string) => void;
  canEdit?: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, canEdit = true }) => {
  const { t } = useLanguage();
  const { canListProducts } = useSubscriptionPermissions();
  const { getCategoryTranslation } = require('@/lib/categoryTranslations');

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-zimbabwe-darkGreen break-words">
            {t.noProductsListed || 'No products listed yet. Add your first product to get started!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort products alphabetically by name
  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-zimbabwe-lightGreen border border-zimbabwe-green rounded-lg font-semibold text-sm">
        <div className="col-span-3">Product</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-2">Brand</div>
        <div className="col-span-2">Price/Unit</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1">Actions</div>
      </div>
      
      {/* Product Cards */}
      <div className="grid gap-4">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
