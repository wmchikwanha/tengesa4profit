
import * as React from 'react';
import { z } from 'zod';
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
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(200, 'Product name must be less than 200 characters'),
  description: z.string().trim().max(2000, 'Description must be less than 2000 characters').optional().or(z.literal('')),
  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 1000000;
  }, 'Price must be between 0 and 1,000,000'),
  unit: z.string().trim().min(1, 'Unit is required').max(50, 'Unit must be less than 50 characters'),
  brand: z.string().trim().max(100, 'Brand must be less than 100 characters').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required')
});

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
  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    name: editingProduct?.name || '',
    description: editingProduct?.description || '',
    price: editingProduct ? convertPrice(editingProduct.price).toFixed(2) : '',
    unit: editingProduct?.unit || '',
    category: (editingProduct?.category || '') as ProductCategory,
    brand: editingProduct?.brand || '',
    isPubliclyVisible: editingProduct?.isPubliclyVisible ?? true,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive'
      });
      return;
    }

    // Clear errors
    setErrors({});

    // Convert price to USD for storage
    const priceInUSD = settings.currentCurrency === 'USD' ? parseFloat(validation.data.price) : parseFloat(validation.data.price) / settings.exchangeRate;

    const productData: MarketplaceProduct = {
      id: editingProduct?.id || crypto.randomUUID(),
      supplierId: supplierProfile.id,
      supplierProfile,
      name: validation.data.name,
      description: validation.data.description || '',
      price: priceInUSD,
      unit: validation.data.unit,
      category: validation.data.category as ProductCategory,
      brand: validation.data.brand || undefined,
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
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                className="trader-input"
                required
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="trader-label break-words">{t.category || 'Category'} *</label>
              <Select 
                value={formData.category} 
                onValueChange={(value: ProductCategory) => {
                  setFormData(prev => ({ ...prev, category: value }));
                  if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                }}
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
              {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="trader-label break-words">{t.unitPrice} ({getCurrencySymbol()}) *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, price: e.target.value }));
                  if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                }}
                className="trader-input"
                required
              />
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
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
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, unit: e.target.value }));
                  if (errors.unit) setErrors(prev => ({ ...prev, unit: '' }));
                }}
                className="trader-input"
                placeholder="e.g., kg, pieces, litres"
                required
              />
              {errors.unit && <p className="text-xs text-red-600 mt-1">{errors.unit}</p>}
            </div>

            <div>
              <label className="trader-label break-words">{t.brand || 'Brand'}</label>
              <Input
                value={formData.brand}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, brand: e.target.value }));
                  if (errors.brand) setErrors(prev => ({ ...prev, brand: '' }));
                }}
                className="trader-input"
              />
              {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand}</p>}
            </div>
          </div>

          <div>
            <label className="trader-label break-words">{t.productDescription || 'Product Description'}</label>
            <Textarea
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              className="trader-input"
              rows={3}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
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
