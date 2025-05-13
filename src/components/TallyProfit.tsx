import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, calculateProduct } from '@/lib/types';
import { AlertCircle, Info, Calendar, Download, Share, History, Save } from 'lucide-react';
import { format } from 'date-fns';
import { downloadPDF, sharePDF } from '@/utils/pdfUtils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const TallyProfit: React.FC = () => {
  const { t } = useLanguage();
  const { products, updateProduct, clearAllData } = useAppData();
  const { toast } = useToast();
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantitySold, setQuantitySold] = useState<number | ''>(0);
  const [quantityDiscarded, setQuantityDiscarded] = useState<number | ''>(0);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const reportRef = useRef<HTMLDivElement>(null);
  
  const today = new Date();
  
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
  
  // Calculate total remaining stock value
  const totalStockValue = products.reduce((sum, product) => {
    const calc = calculateProduct(product);
    return sum + (calc.stockRemaining * calc.sellingPrice);
  }, 0);
  
  const handleSharePDF = async () => {
    try {
      toast({
        title: "Share",
        description: "Generating PDF for sharing...",
      });
      
      await sharePDF('report-content', `trader-profit-report-${format(today, 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "Success",
        description: "Report shared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not generate or share the report",
        variant: "destructive",
      });
    }
  };
  
  const handleDownloadPDF = async () => {
    try {
      toast({
        title: "Download",
        description: "Downloading PDF report...",
      });
      
      await downloadPDF('report-content', `trader-profit-report-${format(today, 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not generate or download the report",
        variant: "destructive",
      });
    }
  };
  
  const handleClearAllData = () => {
    if (window.confirm(t.confirmClearAll)) {
      clearAllData();
      toast({
        title: "Success",
        description: "All data has been cleared",
      });
    }
  };
  
  const handleToggleHistory = () => {
    setViewingHistory(!viewingHistory);
  };
  
  return (
    <div className="space-y-6">
      {/* Date Display */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-700">{t.tallyProfit}</h2>
        <div className="flex items-center gap-2 text-blue-600">
          <Calendar className="h-5 w-5" />
          <span>{format(today, 'PPP')}</span>
        </div>
      </div>
      
      {/* Report Content Wrapper - This div will be used for PDF generation */}
      <div id="report-content" ref={reportRef}>
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
            
            {/* Daily Summary Card */}
            <Card className="bg-blue-100 border border-blue-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-blue-800">{t.dailySummary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between font-bold text-xl">
                  <span>{t.totalProfit}:</span>
                  <span>{t.currency}{totalProfit.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-lg">
                  <span>{t.totalStockValue}:</span>
                  <span>{t.currency}{totalStockValue.toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <Button 
                    onClick={handleSharePDF}
                    variant="outline"
                    className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
                  >
                    <Share className="h-5 w-5" />
                    {t.shareTally}
                  </Button>
                  <Button 
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    {t.downloadReport}
                  </Button>
                  <Button 
                    onClick={handleToggleHistory}
                    variant="outline"
                    className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
                  >
                    <History className="h-5 w-5" />
                    {viewingHistory ? t.hideHistory : t.viewHistory}
                  </Button>
                  <Button 
                    onClick={handleClearAllData}
                    variant="destructive"
                    className="flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" />
                    {t.clearAllData}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Products Summary */}
            <Card className="bg-white border border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-blue-800">{t.productSummary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {products.map(product => {
                  const calc = calculateProduct(product);
                  return (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {t.sold}: {product.quantitySold} | {t.remaining}: {calc.stockRemaining}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{t.currency}{calc.dailyProfit.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {t.profitPerUnit}: {t.currency}{calc.profitPerUnit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default TallyProfit;
