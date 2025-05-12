import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/types';
import { Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  const { products, addProduct, getProduct, deleteProduct, updateProduct } = useAppData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(DEFAULT_PRODUCT);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : value === '' ? '' : Number(value)
    }));
  };

  const handleMarkupChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      markupPercentage: value[0]
    }));
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      sellingPrice: value === '' ? 0 : Number(value)
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
      updateProduct(activeProductId, formData);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
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

  const calculateCostPerUnit = (): number => {
    const quantityBought = Number(formData.quantityBought) || 1; // Prevent division by zero
    const buyingPrice = Number(formData.buyingPrice) || 0;
    const transportCost = Number(formData.transportCost) || 0;
    const stallFee = Number(formData.stallFee) || 0;
    
    return buyingPrice + (transportCost / quantityBought) + (stallFee / quantityBought);
  };
  
  const costPerUnit = calculateCostPerUnit();
  
  // Calculate selling price based on markup if it's not manually set
  const calculatedSellingPrice = formData.sellingPrice || 
    costPerUnit * (1 + formData.markupPercentage / 100);

  return (
    <div className="space-y-6">
      {/* Products List */}
      <Card className="bg-white border border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">{t.productsList}</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                    <Info className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-blue-50 border border-blue-200">
                  <p>{t.productInstructions}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {products.length === 0 ? (
            <p className="text-trader-neutral">{t.noProducts}</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                  <span className="font-medium">{product.name}</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSelectProduct(product.id)}
                      className="border-blue-300 hover:bg-blue-100"
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
            className="trader-input border-blue-200 focus:border-blue-400"
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
            className="trader-input border-blue-200 focus:border-blue-400"
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
            className="trader-input border-blue-200 focus:border-blue-400"
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
            className="trader-input border-blue-200 focus:border-blue-400"
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
            className="trader-input border-blue-200 focus:border-blue-400"
            placeholder="e.g. 3.00"
          />
        </div>
        
        {/* Cost calculations display */}
        <Card className="bg-blue-50 border border-blue-200">
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
                className="trader-input border-blue-200 focus:border-blue-400"
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
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={resetForm}
          >
            {t.clear}
          </Button>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {activeProductId ? t.update : t.save}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
