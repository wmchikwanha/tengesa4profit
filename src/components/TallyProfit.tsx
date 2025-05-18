
import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Product, calculateProduct } from '@/lib/types';
import { AlertCircle, Info, Calendar as CalendarIcon, Download, Share, History, Save, AlertCircle as AlertIcon, Check, X } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay, isEqual } from 'date-fns';
import { downloadPDF, sharePDF } from '@/utils/pdfUtils';
import { useForm } from 'react-hook-form';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DateFilterForm {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const TallyProfit: React.FC = () => {
  const { t } = useLanguage();
  const { products, salesHistory, updateProduct, clearAllData } = useAppData();
  const { toast } = useToast();
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantitySold, setQuantitySold] = useState<number | ''>(0);
  const [quantityDiscarded, setQuantityDiscarded] = useState<number | ''>(0);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState(salesHistory);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  
  const reportRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  
  const form = useForm<DateFilterForm>({
    defaultValues: {
      startDate: undefined,
      endDate: undefined
    }
  });
  
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
      setInvalidFields(new Set());
    }
  };
  
  const handleQuantitySoldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantitySold(value === '' ? '' : Number(value));
    
    // Clear validation error
    if (value !== '') {
      setInvalidFields(prev => {
        const updated = new Set(prev);
        updated.delete('quantitySold');
        return updated;
      });
    }
  };
  
  const handleQuantityDiscardedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantityDiscarded(value === '' ? '' : Number(value));
  };
  
  const validateForm = (): boolean => {
    if (!selectedProduct) return false;
    
    const newInvalidFields = new Set<string>();
    const soldQty = typeof quantitySold === 'number' ? quantitySold : 0;
    
    if (soldQty < 0) {
      newInvalidFields.add('quantitySold');
    }
    
    setInvalidFields(newInvalidFields);
    return newInvalidFields.size === 0;
  };
  
  const handleCalculate = () => {
    if (!selectedProduct) return;
    
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fix the highlighted fields",
        variant: "destructive",
      });
      return;
    }
    
    const soldQty = typeof quantitySold === 'number' ? quantitySold : 0;
    const discardedQty = typeof quantityDiscarded === 'number' ? quantityDiscarded : 0;
    
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
  
  // Calculate total sales value
  const totalSalesValue = products.reduce((sum, product) => {
    return sum + (product.quantitySold * product.sellingPrice);
  }, 0);
  
  // Calculate total cost value
  const totalCostValue = products.reduce((sum, product) => {
    const calc = calculateProduct(product);
    return sum + (product.quantitySold * calc.costPerUnit);
  }, 0);
  
  // Calculate total sales per product across all history (for the summary)
  const calculateTotalSalesPerProduct = (productId: string) => {
    let totalQuantitySold = 0;
    let totalProfit = 0;
    let totalSalesValue = 0;
    let totalCostValue = 0;
    
    // Calculate from current products
    const product = products.find(p => p.id === productId);
    if (product) {
      const calc = calculateProduct(product);
      totalQuantitySold += product.quantitySold || 0;
      totalProfit += calc.dailyProfit;
      totalSalesValue += product.quantitySold * product.sellingPrice;
      totalCostValue += product.quantitySold * calc.costPerUnit;
    }
    
    // Add from history too if available
    filteredHistory.forEach(record => {
      const historyProduct = record.products.find(p => p.id === productId);
      if (historyProduct) {
        const calc = calculateProduct(historyProduct);
        totalQuantitySold += historyProduct.quantitySold || 0;
        totalProfit += calc.dailyProfit;
        totalSalesValue += historyProduct.quantitySold * historyProduct.sellingPrice;
        totalCostValue += historyProduct.quantitySold * calc.costPerUnit;
      }
    });
    
    return { totalQuantitySold, totalProfit, totalSalesValue, totalCostValue };
  };
  
  const handleSharePDF = async () => {
    try {
      toast({
        title: "Share",
        description: "Generating PDF for sharing...",
      });
      
      if (reportRef.current) {
        await sharePDF('report-content', `trader-profit-report-${format(today, 'yyyy-MM-dd')}.pdf`);
        
        toast({
          title: "Success",
          description: "Report shared successfully",
        });
      } else {
        throw new Error("Report content not found");
      }
    } catch (error) {
      console.error("Share PDF error:", error);
      
      // Even if there's an error, try to use the Web Share API directly if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Zim Market Trader - Daily Report',
            text: `Daily sales report for ${format(today, 'PPP')}. Total profit: ${t.currency}${totalProfit.toFixed(2)}`,
          });
          
          toast({
            title: "Success",
            description: "Shared successfully",
          });
          return;
        } catch (shareError) {
          console.error("Share API error:", shareError);
        }
      }
      
      toast({
        title: "Warning",
        description: "Could not generate report, but sharing options will appear",
      });
    }
  };
  
  const handleDownloadPDF = async () => {
    try {
      toast({
        title: "Download",
        description: "Downloading PDF report...",
      });
      
      if (reportRef.current) {
        await downloadPDF('report-content', `trader-profit-report-${format(today, 'yyyy-MM-dd')}.pdf`);
        
        toast({
          title: "Success",
          description: "Report downloaded successfully",
        });
      } else {
        throw new Error("Report content not found");
      }
    } catch (error) {
      console.error("Download PDF error:", error);
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
    if (viewingHistory) {
      // Reset filters when closing history view
      setFilteredHistory(salesHistory);
      form.reset();
    }
  };
  
  const applyDateFilter = (data: DateFilterForm) => {
    const { startDate, endDate } = data;
    
    if (!startDate && !endDate) {
      setFilteredHistory(salesHistory);
      return;
    }
    
    const filtered = salesHistory.filter(record => {
      const recordDate = parseISO(record.date);
      
      if (startDate && endDate) {
        return (
          (isAfter(recordDate, startOfDay(startDate)) || isEqual(recordDate, startDate)) && 
          (isBefore(recordDate, endOfDay(endDate)) || isEqual(recordDate, endDate))
        );
      }
      
      if (startDate && !endDate) {
        return isAfter(recordDate, startOfDay(startDate)) || isEqual(recordDate, startDate);
      }
      
      if (!startDate && endDate) {
        return isBefore(recordDate, endOfDay(endDate)) || isEqual(recordDate, endDate);
      }
      
      return true;
    });
    
    setFilteredHistory(filtered);
    setIsDateFilterOpen(false);
  };
  
  const resetDateFilter = () => {
    form.reset();
    setFilteredHistory(salesHistory);
  };
  
  return (
    <div className="space-y-6">
      {/* Date Display */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-700">{t.tallyProfit}</h2>
        <div className="flex items-center gap-2 text-blue-600">
          <CalendarIcon className="h-5 w-5" />
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
                      <TooltipContent className="bg-blue-50 border border-blue-200 max-w-[250px]">
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
                      <div className="flex items-center gap-1 mb-1">
                        <label htmlFor="quantitySold" className="trader-label">{t.quantitySold}</label>
                        <span className="text-red-500">*</span>
                        {invalidFields.has('quantitySold') && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <Input
                        id="quantitySold"
                        value={quantitySold}
                        onChange={handleQuantitySoldChange}
                        type="number"
                        min="0"
                        max={selectedProduct.quantityBought}
                        className={`trader-input border-blue-200 focus:border-blue-400 ${invalidFields.has('quantitySold') ? 'border-red-500' : ''}`}
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
                          <AlertIcon className="h-5 w-5" />
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
                  <span>{t.totalSalesValue}:</span>
                  <span>{t.currency}{totalSalesValue.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg">
                  <span>{t.totalCostValue}:</span>
                  <span>{t.currency}{totalCostValue.toFixed(2)}</span>
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
            
            {/* History Section */}
            {viewingHistory && (
              <Card className="bg-white border border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <CardTitle className="text-lg font-bold text-blue-800">{t.history}</CardTitle>
                    <div className="flex space-x-2">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(applyDateFilter)} className="flex space-x-2">
                          <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-auto border-blue-300 justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {form.watch('startDate') && form.watch('endDate') ? (
                                  <span>
                                    {format(form.watch('startDate')!, 'PPP')} - {format(form.watch('endDate')!, 'PPP')}
                                  </span>
                                ) : (
                                  <span>{t.selectDateRange}</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <div className="grid gap-2 p-4">
                                <div className="grid gap-2">
                                  <FormLabel>{t.startDate}</FormLabel>
                                  <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => field.value && form.watch('endDate') ? isAfter(date, form.watch('endDate')!) : false}
                                        initialFocus
                                      />
                                    )}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <FormLabel>{t.endDate}</FormLabel>
                                  <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => field.value && form.watch('startDate') ? isBefore(date, form.watch('startDate')!) : false}
                                        initialFocus
                                      />
                                    )}
                                  />
                                </div>
                                <div className="flex justify-between pt-2">
                                  <Button type="button" variant="outline" onClick={resetDateFilter}>
                                    {t.reset}
                                  </Button>
                                  <Button type="submit" onClick={() => setIsDateFilterOpen(false)}>
                                    {t.apply}
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </form>
                      </Form>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredHistory.length === 0 && salesHistory.length === 0 ? (
                    <p className="text-gray-500">{t.noHistory}</p>
                  ) : filteredHistory.length === 0 ? (
                    <p className="text-gray-500">{t.noMatchingHistory}</p>
                  ) : (
                    filteredHistory.map((record, index) => (
                      <div key={index} className="border border-blue-100 rounded-lg p-4 bg-blue-50">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold">
                            {format(parseISO(record.date), 'PPP')}
                          </h3>
                          <span className="font-bold text-blue-700">
                            {t.currency}{record.totalProfit.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {record.products.map(product => {
                            const calc = calculateProduct(product);
                            return (
                              <div key={product.id} className="flex justify-between text-sm">
                                <span>{product.name}</span>
                                <span>
                                  {t.sold}: {product.quantitySold} | {t.currency}{calc.dailyProfit.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Products Summary */}
            <Card className="bg-white border border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-blue-800">{t.productSummary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {products.map(product => {
                  const calc = calculateProduct(product);
                  const totals = calculateTotalSalesPerProduct(product.id);
                  
                  return (
                    <div key={product.id} className="flex flex-col md:flex-row md:justify-between items-start md:items-center p-3 bg-blue-50 rounded-lg">
                      <div className="mb-2 md:mb-0">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {t.sold}: {product.quantitySold} | {t.remaining}: {calc.stockRemaining}
                        </p>
                        <p className="text-xs font-medium text-blue-700 mt-1">
                          {t.salesQty}: {totals.totalQuantitySold}
                        </p>
                      </div>
                      <div className="text-right ml-auto md:ml-0">
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-sm">{t.salesValue}:</span>
                            <span className="font-medium">{t.currency}{totals.totalSalesValue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-sm">{t.costValue}:</span>
                            <span className="font-medium">{t.currency}{totals.totalCostValue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-sm">{t.dailyProfit}:</span>
                            <span className="font-bold text-blue-600">{t.currency}{calc.dailyProfit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-sm">{t.totalProfit}:</span>
                            <span className="font-bold text-blue-700">{t.currency}{totals.totalProfit.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Display grand total at the bottom */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-blue-100 rounded-lg font-bold mt-2">
                  <div className="flex justify-between md:justify-start md:flex-col">
                    <span>{t.totalSalesValue}:</span>
                    <span className="ml-2 md:ml-0">{t.currency}{totalSalesValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between md:justify-start md:flex-col">
                    <span>{t.totalCostValue}:</span>
                    <span className="ml-2 md:ml-0">{t.currency}{totalCostValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between md:justify-start md:flex-col text-lg text-blue-800">
                    <span>{t.totalProfit}:</span>
                    <span className="ml-2 md:ml-0">{t.currency}{totalProfit.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default TallyProfit;
