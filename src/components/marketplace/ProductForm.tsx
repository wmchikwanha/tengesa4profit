
import * as React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PRODUCT_CATEGORIES, type MarketplaceProduct, type ProductCategory, type SupplierProfile } from '@/lib/marketplace-types';
import { getAllCategoryTranslations } from '@/lib/categoryTranslations';

interface ProductFormProps {
  editingProduct: MarketplaceProduct | null;
  supplierProfile: SupplierProfile;
  onSubmit: (productData: MarketplaceProduct) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  editingProduct,
  supplierProfile,
  onSubmit,
  onCancel
}) => {
  const { settings, convertPrice, getCurrencySymbol } = useCurrency();
  const { t } = useLanguage();

  const [formData, setFormData] = React.useState({
    name: editingProduct?.name || '',
    description: editingProduct?.description || '',
    price: editingProduct ? convertPrice(editingProduct.price).toFixed(2) : '',
    unit: editingProduct?.unit || '',
    category: (editingProduct?.category || '') as ProductCategory,
    brand: editingProduct?.brand || '',
    isPubliclyVisible: editingProduct?.isPubliclyVisible ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    onSubmit(productData);
  };

  return (
    <Card className="border-zimbabwe-green">
      <CardHeader>
        <CardTitle className="break-words">
          {editingProduct ? t.update + ' ' + t.productName : t.addProduct}
        </CardTitle>
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
                  {Object.entries(getAllCategoryTranslations(t)).map(([key, label]) => (
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
            <label className="trader-label break-words">{t.productDescription || 'Product Description'}</label>
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
            <label className="text-sm break-words">{t.makeProductVisible || 'Make this product visible to vendors'}</label>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button type="submit" className="bg-zimbabwe-green hover:bg-zimbabwe-darkGreen">
              {editingProduct ? t.update + ' ' + t.productName : t.addProduct}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {t.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
