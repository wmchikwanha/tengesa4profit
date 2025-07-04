
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import { type MarketplaceProduct } from '@/lib/marketplace-types';

export const SupplierProducts: React.FC = () => {
  const { 
    supplierProfile, 
    marketplaceProducts, 
    addMarketplaceProduct, 
    updateMarketplaceProduct, 
    deleteMarketplaceProduct 
  } = useMarketplace();
  
  const { t } = useLanguage();

  const [showForm, setShowForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<MarketplaceProduct | null>(null);

  const supplierProducts = marketplaceProducts.filter(
    product => product.supplierId === supplierProfile?.id
  );

  const resetForm = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = (productData: MarketplaceProduct) => {
    if (editingProduct) {
      updateMarketplaceProduct(editingProduct.id, productData);
    } else {
      addMarketplaceProduct(productData);
    }
    resetForm();
  };

  const handleEdit = (product: MarketplaceProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    deleteMarketplaceProduct(productId);
  };

  if (!supplierProfile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold break-words">
          {t.myProducts} ({supplierProducts.length})
        </h3>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-zimbabwe-green hover:bg-zimbabwe-darkGreen text-xs sm:text-sm px-2 sm:px-4"
        >
          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="break-words">{t.addProduct}</span>
        </Button>
      </div>

      {showForm && (
        <ProductForm
          editingProduct={editingProduct}
          supplierProfile={supplierProfile}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      <ProductList
        products={supplierProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
