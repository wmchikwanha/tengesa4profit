
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
  );
};
