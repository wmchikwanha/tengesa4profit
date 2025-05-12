
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, calculateProduct } from '@/lib/types';
import { AlertCircle, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const TallyProfit: React.FC = () => {
  const { t } = useLanguage();
  const { products, updateProduct } = useAppData();
  const { toast } = useToast();
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantitySold, setQuantitySold] = useState<number | ''>(0);
  const [quantityDiscarded, setQuantityDiscarded] = useState<number | ''>(0);
  
  const selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId)
    : null;
  
  const calculation = selectedProduct && typeof quantitySold === 'number' && typeof quantityDiscarded === 'number'
    ? calculateProduct({
        ...selectedProduct,
        quantitySold,
        quantityDiscarded
      })
    : null;
  
  const handleSelectProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setSelectedProductId(id);
      setQuantitySold(product.quantitySold || 0);
      setQuantityDiscarded(product.quantityDiscarded || 0);
    }
  };
  
  const handleQuantitySoldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantitySold(value === '' ? '' : Number(value));
  };
  
  const handleQuantityDiscardedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantityDiscarded(value === '' ? '' : Number(value));
  };
  
  const handleCalculate = () => {
    if (!selectedProduct) return;
    
    const soldQty = typeof quantitySold === 'number' ? quantitySold : 0;
    const discardedQty = typeof quantityDiscarded === 'number' ? quantityDiscarded : 0;
    
    if (soldQty < 0 || discardedQty < 0) {
      toast({
        title: "Error",
        description: "Quantities cannot be negative",
        variant: "destructive",
      });
      return;
    }
    
    if (soldQty + discardedQty > selectedProduct.quantityBought) {
      toast({
        title: "Error",
        description: "Total quantity cannot exceed quantity bought",
        variant: "destructive",
      });
      return;
    }
    
    // Save updated values
    updateProduct(selectedProductId!, {
      quantitySold: soldQty,
      quantityDiscarded: discardedQty
    });
    
    toast({
      title: "Success",
      description: "Calculation complete",
    });
  };

  // Calculate total profit across all products
  const totalProfit = products.reduce((sum, product) => {
    const calc = calculateProduct(product);
    return sum + calc.dailyProfit;
  }, 0);
  
  return (
    <div className="space-y-6">
      {products.length === 0 ? (
        <Card className="bg-white border border-blue-200">
          <CardContent className="pt-6">
            <p>{t.noProducts}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-white border border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="product-select" className="trader-label">{t.productName}</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                        <Info className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue-50 border border-blue-200">
                      <p>{t.tallyInstructions}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <Select value={selectedProductId || ''} onValueChange={handleSelectProduct}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          {selectedProduct && (
            <div className="space-y-4">
              <Card className="bg-white border border-blue-200">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
                  
                  <div>
                    <label htmlFor="quantitySold" className="trader-label">
                      {t.quantitySold}
                    </label>
                    <Input
                      id="quantitySold"
                      value={quantitySold}
                      onChange={handleQuantitySoldChange}
                      type="number"
                      min="0"
                      max={selectedProduct.quantityBought}
                      className="trader-input border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="quantityDiscarded" className="trader-label">
                      {t.quantityDiscarded} <span className="text-sm text-trader-neutral">({t.optional})</span>
                    </label>
                    <Input
                      id="quantityDiscarded"
                      value={quantityDiscarded}
                      onChange={handleQuantityDiscardedChange}
                      type="number"
                      min="0"
                      max={selectedProduct.quantityBought - (typeof quantitySold === 'number' ? quantitySold : 0)}
                      className="trader-input border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCalculate}
                    className="trader-btn-accent w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {t.calculate}
                  </Button>
                </CardContent>
              </Card>
              
              {calculation && (
                <Card className={calculation.lowMargin ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}>
                  <CardContent className="pt-6">
                    {calculation.lowMargin && (
                      <div className="flex items-center gap-2 mb-4 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-bold">{t.lowProfitWarning}</p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-semibold">{t.costPerUnit}:</span>
                        <span>{t.currency}{calculation.costPerUnit.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-semibold">{t.sellingPrice}:</span>
                        <span>{t.currency}{calculation.sellingPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-semibold">{t.profitPerUnit}:</span>
                        <span>{t.currency}{calculation.profitPerUnit.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-semibold">{t.stockRemaining}:</span>
                        <span>{calculation.stockRemaining}</span>
                      </div>
                      
                      <div className="flex justify-between font-bold text-lg">
                        <span>{t.dailyProfit}:</span>
                        <span>{t.currency}{calculation.dailyProfit.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <Card className="bg-blue-100 border border-blue-300">
            <CardContent className="pt-6">
              <div className="flex justify-between font-bold text-xl">
                <span>{t.totalProfit}:</span>
                <span>{t.currency}{totalProfit.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TallyProfit;
