
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DEFAULT_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  quantityBought: 0,
  buyingPrice: 0,
  transportCost: 0,
  stallFee: 0,
  markupPercentage: 20,
  sellingPrice: 0,
  quantitySold: 0,
  quantityDiscarded: 0
};

const ProductForm: React.FC = () => {
  const { t } = useLanguage();
  const { products, addProduct, getProduct, deleteProduct } = useAppData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(DEFAULT_PRODUCT);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }));
  };

  const handleMarkupChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      markupPercentage: value[0]
    }));
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sellingPrice = Number(e.target.value);
    setFormData(prev => ({
      ...prev,
      sellingPrice
    }));
  };

  const handleSelectProduct = (id: string) => {
    const product = getProduct(id);
    if (product) {
      setFormData(product);
      setActiveProductId(id);
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    if (activeProductId === id) {
      setFormData(DEFAULT_PRODUCT);
      setActiveProductId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.quantityBought <= 0 || formData.buyingPrice <= 0) {
      toast({
        title: "Error",
        description: "Quantity and buying price must be greater than zero",
        variant: "destructive",
      });
      return;
    }
    
    if (activeProductId) {
      // Update existing product
      // Note: We're not implementing this in our initial version
    } else {
      // Add new product
      addProduct(formData);
      toast({
        title: "Success",
        description: "Product saved successfully",
      });
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_PRODUCT);
    setActiveProductId(null);
  };

  const costPerUnit = 
    formData.buyingPrice + 
    (formData.transportCost / (formData.quantityBought || 1)) + 
    (formData.stallFee / (formData.quantityBought || 1));
  
  // Calculate selling price based on markup if it's not manually set
  const calculatedSellingPrice = formData.sellingPrice || 
    costPerUnit * (1 + formData.markupPercentage / 100);

  return (
    <div className="space-y-6">
      {/* Products List */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-2">{t.productsList}</h2>
          {products.length === 0 ? (
            <p className="text-trader-neutral">{t.noProducts}</p>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className="flex justify-between items-center bg-trader-secondaryBg/50 p-3 rounded-lg">
                  <span className="font-medium">{product.name}</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      {t.loadProduct}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      {t.deleteProduct}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="trader-label">{t.productName}</label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="trader-input"
            placeholder="e.g. Tomatoes"
          />
        </div>
        
        <div>
          <label htmlFor="quantityBought" className="trader-label">{t.quantityBought}</label>
          <Input
            id="quantityBought"
            name="quantityBought"
            value={formData.quantityBought || ''}
            onChange={handleChange}
            type="number"
            min="1"
            className="trader-input"
            placeholder="e.g. 100"
          />
        </div>
        
        <div>
          <label htmlFor="buyingPrice" className="trader-label">
            {t.buyingPrice} ({t.currency})
          </label>
          <Input
            id="buyingPrice"
            name="buyingPrice"
            value={formData.buyingPrice || ''}
            onChange={handleChange}
            type="number"
            min="0.01"
            step="0.01"
            className="trader-input"
            placeholder="e.g. 0.50"
          />
        </div>
        
        <div>
          <label htmlFor="transportCost" className="trader-label">
            {t.transportCost} ({t.currency}) <span className="text-sm text-trader-neutral">({t.optional})</span>
          </label>
          <Input
            id="transportCost"
            name="transportCost"
            value={formData.transportCost || ''}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            className="trader-input"
            placeholder="e.g. 5.00"
          />
        </div>
        
        <div>
          <label htmlFor="stallFee" className="trader-label">
            {t.stallFee} ({t.currency}) <span className="text-sm text-trader-neutral">({t.optional})</span>
          </label>
          <Input
            id="stallFee"
            name="stallFee"
            value={formData.stallFee || ''}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            className="trader-input"
            placeholder="e.g. 3.00"
          />
        </div>
        
        {/* Cost calculations display */}
        <Card className="bg-trader-secondaryBg/50">
          <CardContent className="pt-6">
            <div className="mb-4">
              <p className="font-semibold">{t.costPerUnit}: {t.currency}{costPerUnit.toFixed(2)}</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="markupPercentage" className="trader-label">
                {t.markupPercentage}: {formData.markupPercentage}%
              </label>
              <Slider
                id="markupPercentage"
                min={0}
                max={100}
                step={1}
                defaultValue={[formData.markupPercentage]}
                value={[formData.markupPercentage]}
                onValueChange={handleMarkupChange}
                className="py-4"
              />
            </div>
            
            <div>
              <label htmlFor="sellingPrice" className="trader-label">
                {t.desiredSellingPrice} ({t.currency})
              </label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice || ''}
                onChange={handleSellingPriceChange}
                type="number"
                min="0.01"
                step="0.01"
                className="trader-input"
                placeholder={calculatedSellingPrice.toFixed(2)}
              />
              <p className="text-sm text-trader-neutral mt-1">
                {formData.sellingPrice ? `${t.markupPercentage}: ${(((formData.sellingPrice / costPerUnit) - 1) * 100).toFixed(0)}%` : 
                  `${t.sellingPrice}: ${t.currency}${calculatedSellingPrice.toFixed(2)}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={resetForm}
          >
            {t.clear}
          </Button>
          <Button
            type="submit"
            className="trader-btn-primary w-full"
          >
            {t.save}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
