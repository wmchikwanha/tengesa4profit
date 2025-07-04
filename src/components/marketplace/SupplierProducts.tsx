
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PRODUCT_CATEGORIES, type MarketplaceProduct, type ProductCategory } from '@/lib/marketplace-types';

export const SupplierProducts: React.FC = () => {
  const { 
    supplierProfile, 
    marketplaceProducts, 
    addMarketplaceProduct, 
    updateMarketplaceProduct, 
    deleteMarketplaceProduct 
  } = useMarketplace();
  
  const { settings, convertPrice, getCurrencySymbol } = useCurrency();
  const { t } = useLanguage();

  const [showForm, setShowForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<MarketplaceProduct | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    price: '',
    unit: '',
    category: '' as ProductCategory,
    brand: '',
    isPubliclyVisible: true,
  });

  const supplierProducts = marketplaceProducts.filter(
    product => product.supplierId === supplierProfile?.id
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      unit: '',
      category: '' as ProductCategory,
      brand: '',
      isPubliclyVisible: true,
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierProfile) return;

    // Convert price to USD for storage
    const priceInUSD = settings.currentCurrency === 'USD' ? parseFloat(formData.price) : parseFloat(formData.price) / settings.exchangeRate;

    const productData: MarketplaceProduct = {
      id: editingProduct?.id || crypto.randomUUID(),
      supplierId: supplierProfile.id,
      supplierProfile,
      name: formData.name,
      description: formData.description,
      price: priceInUSD,
      unit: formData.unit,
      category: formData.category,
      brand: formData.brand || undefined,
      isPubliclyVisible: formData.isPubliclyVisible,
      dateOfListing: editingProduct?.dateOfListing || new Date().toISOString(),
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingProduct) {
      updateMarketplaceProduct(editingProduct.id, productData);
    } else {
      addMarketplaceProduct(productData);
    }

    resetForm();
  };

  const handleEdit = (product: MarketplaceProduct) => {
    // Convert price to display currency
    const displayPrice = convertPrice(product.price);
    
    setFormData({
      name: product.name,
      description: product.description,
      price: displayPrice.toFixed(2),
      unit: product.unit,
      category: product.category,
      brand: product.brand || '',
      isPubliclyVisible: product.isPubliclyVisible,
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm(t.deleteWarning || 'Are you sure you want to delete this product?')) {
      deleteMarketplaceProduct(productId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold break-words">{t.myProducts} ({supplierProducts.length})</h3>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-zimbabwe-green hover:bg-zimbabwe-darkGreen text-xs sm:text-sm px-2 sm:px-4"
        >
          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="break-words">{t.addProduct}</span>
        </Button>
      </div>

      {showForm && (
        <Card className="border-zimbabwe-green">
          <CardHeader>
            <CardTitle className="break-words">{editingProduct ? t.update + ' ' + t.productName : t.addProduct}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="trader-label break-words">{t.productName} *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="trader-input"
                    required
                  />
                </div>

                <div>
                  <label className="trader-label break-words">{t.category || 'Category'} *</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: ProductCategory) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="trader-input">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="trader-label break-words">{t.unitPrice} ({getCurrencySymbol()}) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="trader-input"
                    required
                  />
                  {settings.currentCurrency !== 'USD' && (
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ ${settings.currentCurrency === 'ZWL' ? (parseFloat(formData.price || '0') / settings.exchangeRate).toFixed(2) : (parseFloat(formData.price || '0') * settings.exchangeRate).toFixed(2)} USD
                    </p>
                  )}
                </div>

                <div>
                  <label className="trader-label break-words">{t.unit} *</label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="trader-input"
                    placeholder="e.g., kg, pieces, litres"
                    required
                  />
                </div>

                <div>
                  <label className="trader-label break-words">{t.brand || 'Brand'}</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="trader-input"
                  />
                </div>
              </div>

              <div>
                <label className="trader-label break-words">{t.businessDescription}</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="trader-input"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.isPubliclyVisible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPubliclyVisible: !!checked }))}
                />
                <label className="text-sm break-words">{t.makeProductVisible || 'Make this product visible to traders'}</label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-zimbabwe-green hover:bg-zimbabwe-darkGreen">
                  {editingProduct ? t.update + ' ' + t.productName : t.addProduct}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {supplierProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-zimbabwe-darkGreen break-words">{t.noProductsListed || 'No products listed yet. Add your first product to get started!'}</p>
            </CardContent>
          </Card>
        ) : (
          supplierProducts.map((product) => (
            <Card key={product.id} className="border-zimbabwe-green">
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
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
