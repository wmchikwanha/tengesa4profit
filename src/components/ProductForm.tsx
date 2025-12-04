
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
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
import { Product, UnitOfMeasurement, calculateProduct } from '@/lib/types';
import { Info, Calendar, Save, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import CurrencySelector from './CurrencySelector';
import ProductsTable from './ProductsTable';

const DEFAULT_PRODUCT: Omit<Product, 'id'> = {
  name: '',
  supplier: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  saleDate: '',
  quantityBought: 0,
  unitOfMeasurement: 'each',
  buyingPrice: 0,
  transportCost: 0,
  stallFee: 0,
  markupPercentage: 20,
  sellingPrice: 0,
  quantitySold: 0,
  quantityDiscarded: 0,
  description: ''
};

const unitOptions: { value: UnitOfMeasurement; label: string }[] = [
  { value: 'bundle', label: 'bundle' },
  { value: 'carton', label: 'carton' },
  { value: 'case', label: 'case' },
  { value: 'centimetre', label: 'centimetre' },
  { value: 'container', label: 'container' },
  { value: 'each', label: 'each' },
  { value: 'gram', label: 'gram' },
  { value: 'kilogramme', label: 'kilogramme' },
  { value: 'litre', label: 'litre' },
  { value: 'metre', label: 'metre' },
  { value: 'millilitre', label: 'millilitre' },
  { value: 'millimetre', label: 'millimetre' },
  { value: 'pack', label: 'pack' },
  { value: 'packet', label: 'packet' },
  { value: 'piece', label: 'piece' },
  { value: 'set', label: 'set' },
  { value: 'ton', label: 'ton' }
];

const ProductForm: React.FC = () => {
  const { t } = useLanguage();
  const { products, addProduct, getProduct, deleteProduct, updateProduct } = useAppData();
  const { formatPrice, getCurrencySymbol } = useCurrency();
  const { toast } = useToast();
  
  const [formData, setFormData] = React.useState<Omit<Product, 'id'>>(DEFAULT_PRODUCT);
  const [activeProductId, setActiveProductId] = React.useState<string | null>(null);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = React.useState(false);
  const [stockQuantityToAdd, setStockQuantityToAdd] = React.useState<string>('');
  const [newPurchasePrice, setNewPurchasePrice] = React.useState<string>('');
  const [targetProductId, setTargetProductId] = React.useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<string | null>(null);
  const [invalidFields, setInvalidFields] = React.useState<Set<string>>(new Set());
  
  const today = new Date();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'name' || name === 'supplier' || name === 'purchaseDate' || name === 'saleDate' || name === 'description') ? value : value === '' ? 0 : Number(value)
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
        
        // Update product while preserving quantitySold and quantityDiscarded
        updateProduct(activeProductId, {
          ...formData,
          quantitySold: existingProduct.quantitySold,
          quantityDiscarded: existingProduct.quantityDiscarded
        });
        
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
    const product = getProduct(id);
    setTargetProductId(id);
    setStockQuantityToAdd('');
    setNewPurchasePrice(product?.buyingPrice?.toString() || '');
    setIsAddStockDialogOpen(true);
  };

  const handleAddStock = () => {
    const product = getProduct(targetProductId!);
    if (!product) return;
    
    const quantityToAdd = Number(stockQuantityToAdd);
    const newPrice = Number(newPurchasePrice);
    
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(newPrice) || newPrice <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate weighted average cost
    const existingQty = product.quantityBought;
    const existingPrice = product.buyingPrice;
    const weightedAveragePrice = 
      (existingQty * existingPrice + quantityToAdd * newPrice) / (existingQty + quantityToAdd);
    
    updateProduct(targetProductId!, {
      quantityBought: product.quantityBought + quantityToAdd,
      buyingPrice: Number(weightedAveragePrice.toFixed(2))
    });
    
    toast({
      title: "Success",
      description: `${t.stockAddedNewAverage}: ${formatPrice(weightedAveragePrice)}`,
    });
    
    // Close the dialog
    setIsAddStockDialogOpen(false);
    
    // Select the product we just added stock to
    handleSelectProduct(targetProductId!);
  };

  // Extract unique product names and supplier names for autocomplete
  const uniqueProductNames = React.useMemo(() => 
    [...new Set(products.map(p => p.name).filter(Boolean))],
    [products]
  );
  
  const uniqueSupplierNames = React.useMemo(() => 
    [...new Set(products.map(p => p.supplier).filter(Boolean))],
    [products]
  );
  
  // Calculate weighted average preview for Add Stock dialog
  const weightedAveragePreview = React.useMemo(() => {
    const product = targetProductId ? getProduct(targetProductId) : null;
    if (!product) return null;
    
    const quantityToAdd = Number(stockQuantityToAdd) || 0;
    const newPrice = Number(newPurchasePrice) || 0;
    
    if (quantityToAdd <= 0 || newPrice <= 0) return null;
    
    const existingQty = product.quantityBought;
    const existingPrice = product.buyingPrice;
    return (existingQty * existingPrice + quantityToAdd * newPrice) / (existingQty + quantityToAdd);
  }, [targetProductId, stockQuantityToAdd, newPurchasePrice, getProduct]);

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

  // Calculate total stock value across all products
  const totalStockValue = products.reduce((sum, product) => {
    const calc = calculateProduct(product);
    return sum + (calc.stockRemaining * calc.sellingPrice);
  }, 0);

  // Calculate total profit
  const totalProfit = products.reduce((sum, product) => {
    const calc = calculateProduct(product);
    return sum + calc.dailyProfit;
  }, 0);

  // Get lastClearDate from context
  const { lastClearDate } = useAppData();
  
  // Determine profit label based on lastClearDate
  const profitLabel = lastClearDate 
    ? `${t.totalProfit} (Since ${lastClearDate})` 
    : t.totalProfitAllTime;

  return (
    <div className="space-y-6">
      {/* Date Display and Currency Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zimbabwe-darkGreen">{t.addProduct}</h2>
        <div className="flex items-center gap-2 text-zimbabwe-darkGreen">
          <Calendar className="h-5 w-5" />
          <span>{format(today, 'PPP')}</span>
        </div>
      </div>
      
      <CurrencySelector />

      {/* Running Stock Value & Profit Display */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-white border-2 border-blue-500">
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground mb-1">{t.stockValueOnHand}</div>
              <div className="font-bold text-2xl text-blue-600">{formatPrice(totalStockValue)}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-green-500">
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground mb-1">{profitLabel}</div>
              <div className="font-bold text-2xl text-green-600">{formatPrice(totalProfit)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="purchaseDate" className="trader-label">{t.dateOfPurchase}</label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            value={formData.purchaseDate || ''}
            onChange={handleChange}
            type="date"
            max={new Date().toISOString().split('T')[0]}
            className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
          />
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <label htmlFor="name" className="trader-label">{t.productName}</label>
            <span className="text-red-500">*</span>
            {invalidFields.has('name') && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <AutocompleteInput
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            suggestions={uniqueProductNames}
            className={`trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen ${invalidFields.has('name') ? 'border-red-500' : ''}`}
            placeholder="e.g. Tomatoes"
          />
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <label htmlFor="supplier" className="trader-label">{t.supplier}</label>
            <span className="text-red-500">*</span>
            {invalidFields.has('supplier') && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <AutocompleteInput
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            suggestions={uniqueSupplierNames}
            className={`trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen ${invalidFields.has('supplier') ? 'border-red-500' : ''}`}
            placeholder="e.g. ABC Farm"
          />
        </div>

        <div>
          <label htmlFor="description" className="trader-label">
            {t.description} <span className="text-sm text-trader-neutral">({t.optional})</span>
          </label>
          <Input
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
            placeholder={t.description}
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
              className={`trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen ${invalidFields.has('quantityBought') ? 'border-red-500' : ''}`}
              placeholder="e.g. 100"
            />
          </div>
          
          <div>
            <label htmlFor="unitOfMeasurement" className="trader-label">{t.unit}</label>
            <Select
              value={formData.unitOfMeasurement}
              onValueChange={handleUnitChange}
            >
              <SelectTrigger className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen">
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
            <label htmlFor="buyingPrice" className="trader-label">{t.unitPriceDollar}</label>
            <span className="text-red-500">*</span>
            {invalidFields.has('buyingPrice') && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <Input
            id="buyingPrice"
            name="buyingPrice"
            value={formData.buyingPrice || ''}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            className={`trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen ${invalidFields.has('buyingPrice') ? 'border-red-500' : ''}`}
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
            value={formData.transportCost || ''}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
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
            value={formData.stallFee || ''}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
            placeholder="e.g. 3.00"
          />
        </div>
        
        {/* Cost calculations display */}
        <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
          <CardContent className="pt-6">
            <div className="mb-4">
              <p className="font-semibold text-zimbabwe-darkGreen">{t.costPerUnit}: {formatPrice(costPerUnit)} per {formData.unitOfMeasurement}</p>
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
              <p className="text-xs text-gray-600 mt-1">
                Note: Markup % = Profit ÷ Cost. Report margin % = Profit ÷ Sales (always lower)
              </p>
            </div>
            
            <div>
              <label htmlFor="sellingPrice" className="trader-label">
                {t.desiredSellingPrice} ({getCurrencySymbol()}) per {formData.unitOfMeasurement}
              </label>
              <Input
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice || ''}
                onChange={handleChange}
                type="number"
                min="0"
                step="0.01"
                className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
                placeholder={formatPrice(calculatedSellingPrice)}
              />
              <p className="text-sm text-gray-600 mt-1">
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
            className="flex-1 border-zimbabwe-green text-zimbabwe-darkGreen hover:bg-zimbabwe-lightGreen"
            onClick={resetForm}
          >
            {activeProductId ? t.clearForm : t.clearForm}
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-zimbabwe-darkGreen hover:bg-zimbabwe-green text-white"
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

      {/* Products Table - moved to bottom */}
      <ProductsTable
        products={products}
        onEditProduct={handleSelectProduct}
        onDeleteProduct={confirmDelete}
      />

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
                className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPurchasePrice" className="trader-label">
                {t.newPurchasePrice} ({getCurrencySymbol()})
              </label>
              <Input
                id="newPurchasePrice"
                value={newPurchasePrice}
                onChange={(e) => setNewPurchasePrice(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
              />
            </div>
            {weightedAveragePreview !== null && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700 font-medium">
                  {t.newCostPerItemWillBe}: {formatPrice(weightedAveragePreview)}
                </p>
              </div>
            )}
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
