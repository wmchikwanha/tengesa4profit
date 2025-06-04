import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, UnitOfMeasurement } from '@/lib/types';
import { Info, Calendar, Save, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import CurrencySelector from './CurrencySelector';

const DEFAULT_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  supplier: '',
  quantityBought: 0,
  unitOfMeasurement: 'each',
  buyingPrice: 0,
  transportCost: 0,
  stallFee: 0,
  markupPercentage: 20,
  sellingPrice: 0,
  quantitySold: 0,
  quantityDiscarded: 0
};

const unitOptions: { value: UnitOfMeasurement; label: string }[] = [
  { value: 'each', label: 'Each' },
  { value: 'gram', label: 'Gram' },
  { value: 'kg', label: 'KG' },
  { value: 'ton', label: 'Ton' },
  { value: 'cm', label: 'CM' },
  { value: 'mm', label: 'MM' },
  { value: 'metre', label: 'Metre' },
  { value: 'inch', label: 'Inch' },
  { value: 'litre', label: 'Litre' },
  { value: 'pint', label: 'Pint' },
  { value: 'gallon', label: 'Gallon' },
  { value: 'cup', label: 'Cup' },
  { value: 'bucket', label: 'Bucket' }
];

const ProductForm: React.FC = () => {
  const { t } = useLanguage();
  const { products, addProduct, getProduct, deleteProduct, updateProduct } = useAppData();
  const { formatPrice, getCurrencySymbol, convertPrice } = useCurrency();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(DEFAULT_PRODUCT);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [stockQuantityToAdd, setStockQuantityToAdd] = useState<string>('');
  const [targetProductId, setTargetProductId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  
  const today = new Date();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'name' || name === 'supplier') ? value : value === '' ? '' : Number(value)
    }));
    
    // Clear validation error when field is filled
    if (value) {
      setInvalidFields(prev => {
        const updated = new Set(prev);
        updated.delete(name);
        return updated;
      });
    }
  };

  const handleUnitChange = (value: UnitOfMeasurement) => {
    setFormData(prev => ({
      ...prev,
      unitOfMeasurement: value
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
      setFormData({...product});
      setActiveProductId(id);
    }
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    
    deleteProduct(productToDelete);
    if (activeProductId === productToDelete) {
      setFormData(DEFAULT_PRODUCT);
      setActiveProductId(null);
    }
    
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
    
    toast({
      title: "Success",
      description: "Product deleted successfully",
    });
  };

  const validateForm = (): boolean => {
    const newInvalidFields = new Set<string>();
    
    if (!formData.name) {
      newInvalidFields.add('name');
    }
    
    if (!formData.supplier) {
      newInvalidFields.add('supplier');
    }
    
    if (!formData.quantityBought || formData.quantityBought <= 0) {
      newInvalidFields.add('quantityBought');
    }
    
    if (!formData.buyingPrice || formData.buyingPrice <= 0) {
      newInvalidFields.add('buyingPrice');
    }
    
    setInvalidFields(newInvalidFields);
    return newInvalidFields.size === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (activeProductId) {
      // Update existing product, preserving quantitySold/Discarded
      const existingProduct = getProduct(activeProductId);
      if (existingProduct) {
        // Calculate the quantity change
        const quantityDifference = formData.quantityBought - existingProduct.quantityBought;
        
        // If quantity is reduced, ensure it doesn't go below what's been sold/discarded
        const totalUsed = existingProduct.quantitySold + existingProduct.quantityDiscarded;
        if (formData.quantityBought < totalUsed) {
          toast({
            title: "Error",
            description: "Quantity cannot be less than what has already been sold or discarded",
            variant: "destructive",
          });
          return;
        }
        
        updateProduct(activeProductId, formData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      }
    } else {
      // Add new product
      addProduct(formData);
      toast({
        title: "Success",
        description: "Product saved successfully",
      });
    }
  };

  const openAddStockDialog = (id: string) => {
    setTargetProductId(id);
    setStockQuantityToAdd('');
    setIsAddStockDialogOpen(true);
  };

  const handleAddStock = () => {
    const product = getProduct(targetProductId!);
    if (!product) return;
    
    const quantityToAdd = Number(stockQuantityToAdd);
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }
    
    updateProduct(targetProductId!, {
      quantityBought: product.quantityBought + quantityToAdd
    });
    
    toast({
      title: "Success",
      description: "Stock added successfully",
    });
    
    // Close the dialog
    setIsAddStockDialogOpen(false);
    
    // Select the product we just added stock to
    handleSelectProduct(targetProductId!);
  };

  const resetForm = () => {
    setFormData(DEFAULT_PRODUCT);
    setActiveProductId(null);
    setInvalidFields(new Set());
  };

  const calculateCostPerUnit = (): number => {
    const quantityBought = Number(formData.quantityBought) || 1;
    const buyingPrice = Number(formData.buyingPrice) || 0;
    const transportCost = Number(formData.transportCost) || 0;
    const stallFee = Number(formData.stallFee) || 0;
    
    return buyingPrice + (transportCost / quantityBought) + (stallFee / quantityBought);
  };
  
  const costPerUnit = calculateCostPerUnit();
  
  // Calculate selling price based on markup if it's not manually set
  const calculatedSellingPrice = formData.sellingPrice || 
    costPerUnit * (1 + formData.markupPercentage / 100);

  // Format prices with currency conversion for display in USD amounts but convert for ZWL
  const formatInputPrice = (usdPrice: number): string => {
    return convertPrice(usdPrice).toFixed(2);
  };

  const parseInputPrice = (displayValue: string): number => {
    const numValue = Number(displayValue);
    // Convert back to USD for storage
    return getCurrencySymbol() === 'ZWL' ? numValue / (convertPrice(1)) : numValue;
  };

  return (
    <div className="space-y-6">
      {/* Date Display and Currency Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-700">{t.addProduct}</h2>
        <div className="flex items-center gap-2 text-blue-600">
          <Calendar className="h-5 w-5" />
          <span>{format(today, 'PPP')}</span>
        </div>
      </div>
      
      <CurrencySelector />
      
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
                <TooltipContent className="bg-blue-50 border border-blue-200 max-w-[250px]">
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
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <p className="text-sm text-gray-600">Supplier: {product.supplier}</p>
                    <p className="text-sm text-gray-500">{product.quantityBought} {product.unitOfMeasurement}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openAddStockDialog(product.id)}
                      className="border-green-300 hover:bg-green-100"
                    >
                      {t.addDelivery}
                    </Button>
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
                      onClick={() => confirmDelete(product.id)}
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
          <div className="flex items-center gap-1 mb-1">
            <label htmlFor="name" className="trader-label">{t.productName}</label>
            <span className="text-red-500">*</span>
            {invalidFields.has('name') && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`trader-input border-blue-200 focus:border-blue-400 ${invalidFields.has('name') ? 'border-red-500' : ''}`}
            placeholder="e.g. Tomatoes"
          />
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <label htmlFor="supplier" className="trader-label">Supplier</label>
            <span className="text-red-500">*</span>
            {invalidFields.has('supplier') && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <Input
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className={`trader-input border-blue-200 focus:border-blue-400 ${invalidFields.has('supplier') ? 'border-red-500' : ''}`}
            placeholder="e.g. ABC Farm"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <label htmlFor="quantityBought" className="trader-label">{t.quantityBought}</label>
              <span className="text-red-500">*</span>
              {invalidFields.has('quantityBought') && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <Input
              id="quantityBought"
              name="quantityBought"
              value={formData.quantityBought || ''}
              onChange={handleChange}
              type="number"
              min="1"
              className={`trader-input border-blue-200 focus:border-blue-400 ${invalidFields.has('quantityBought') ? 'border-red-500' : ''}`}
              placeholder="e.g. 100"
            />
          </div>
          
          <div>
            <label htmlFor="unitOfMeasurement" className="trader-label">Unit</label>
            <Select
              value={formData.unitOfMeasurement}
              onValueChange={handleUnitChange}
            >
              <SelectTrigger className="trader-input border-blue-200 focus:border-blue-400">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {unitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-1 mb-1">
            <label htmlFor="buyingPrice" className="trader-label">Unit Price ({getCurrencySymbol()})</label>
            <span className="text-red-500">*</span>
            {invalidFields.has('buyingPrice') && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <Input
            id="buyingPrice"
            name="buyingPrice"
            value={formData.buyingPrice ? formatInputPrice(formData.buyingPrice) : ''}
            onChange={(e) => {
              const usdValue = parseInputPrice(e.target.value);
              setFormData(prev => ({ ...prev, buyingPrice: usdValue }));
            }}
            type="number"
            min="0.01"
            step="0.01"
            className={`trader-input border-blue-200 focus:border-blue-400 ${invalidFields.has('buyingPrice') ? 'border-red-500' : ''}`}
            placeholder="e.g. 0.50"
          />
        </div>
        
        <div>
          <label htmlFor="transportCost" className="trader-label">
            {t.transportCost} ({getCurrencySymbol()}) <span className="text-sm text-trader-neutral">({t.optional})</span>
          </label>
          <Input
            id="transportCost"
            name="transportCost"
            value={formData.transportCost ? formatInputPrice(formData.transportCost) : ''}
            onChange={(e) => {
              const usdValue = parseInputPrice(e.target.value);
              setFormData(prev => ({ ...prev, transportCost: usdValue }));
            }}
            type="number"
            min="0"
            step="0.01"
            className="trader-input border-blue-200 focus:border-blue-400"
            placeholder="e.g. 5.00"
          />
        </div>
        
        <div>
          <label htmlFor="stallFee" className="trader-label">
            {t.otherFees} ({getCurrencySymbol()}) <span className="text-sm text-trader-neutral">({t.optional}) e.g. stall, rates, parking</span>
          </label>
          <Input
            id="stallFee"
            name="stallFee"
            value={formData.stallFee ? formatInputPrice(formData.stallFee) : ''}
            onChange={(e) => {
              const usdValue = parseInputPrice(e.target.value);
              setFormData(prev => ({ ...prev, stallFee: usdValue }));
            }}
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
              <p className="font-semibold">{t.costPerUnit}: {formatPrice(costPerUnit)} per {formData.unitOfMeasurement}</p>
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
                {t.desiredSellingPrice} ({getCurrencySymbol()}) per {formData.unitOfMeasurement}
              </label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice ? formatInputPrice(formData.sellingPrice) : ''}
                onChange={(e) => {
                  const usdValue = parseInputPrice(e.target.value);
                  setFormData(prev => ({ ...prev, sellingPrice: usdValue }));
                }}
                type="number"
                min="0.01"
                step="0.01"
                className="trader-input border-blue-200 focus:border-blue-400"
                placeholder={formatPrice(calculatedSellingPrice)}
              />
              <p className="text-sm text-trader-neutral mt-1">
                {formData.sellingPrice ? `${t.markupPercentage}: ${(((formData.sellingPrice / costPerUnit) - 1) * 100).toFixed(0)}%` : 
                  `${t.sellingPrice}: ${formatPrice(calculatedSellingPrice)} per ${formData.unitOfMeasurement}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={resetForm}
          >
            {activeProductId ? t.clearForm : t.clearForm}
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {activeProductId ? t.update : t.save}
          </Button>
        </div>
        
        {/* New Product Button - shows after saving or updating */}
        {products.length > 0 && (
          <Button
            type="button"
            onClick={resetForm}
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {t.newProduct}
          </Button>
        )}
      </form>

      {/* Add Stock Dialog */}
      <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.addDeliveryPrompt}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="stockQuantity" className="trader-label">
                {t.enterQuantity}
              </label>
              <Input
                id="stockQuantity"
                value={stockQuantityToAdd}
                onChange={(e) => setStockQuantityToAdd(e.target.value)}
                type="number"
                min="1"
                className="trader-input border-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddStockDialogOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button 
              type="button" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAddStock}
            >
              {t.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirmation}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.deleteProduct}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductForm;
