
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionPermissions } from '@/hooks/useSubscriptionPermissions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import { type MarketplaceProduct } from '@/lib/marketplace-types';
import { UpgradePrompt } from '@/components/UpgradePrompt';

export const SupplierProducts: React.FC = () => {
  const { 
    supplierProfile, 
    marketplaceProducts, 
    addMarketplaceProduct, 
    updateMarketplaceProduct, 
    deleteMarketplaceProduct 
  } = useMarketplace();
  
  const { t } = useLanguage();
  const { canListProducts, showUpgradePrompt } = useSubscriptionPermissions();

  const [showForm, setShowForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<MarketplaceProduct | null>(null);
  const [showUpgradePromptModal, setShowUpgradePromptModal] = React.useState(false);

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
    if (!canListProducts) {
      setShowUpgradePromptModal(true);
      return;
    }
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddProduct = () => {
    if (!canListProducts) {
      setShowUpgradePromptModal(true);
      return;
    }
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
          onClick={handleAddProduct}
          className={`text-xs sm:text-sm px-2 sm:px-4 ${canListProducts 
            ? 'bg-zimbabwe-green hover:bg-zimbabwe-darkGreen' 
            : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!canListProducts}
        >
          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="break-words">
            {canListProducts ? t.addProduct : 'Upgrade to add products'}
          </span>
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
        canEdit={canListProducts}
      />

      {showUpgradePromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <UpgradePrompt
              feature="Product Management"
              description="Upgrade to add and edit products in your supplier listing."
              onUpgrade={() => setShowUpgradePromptModal(false)}
            />
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowUpgradePromptModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
