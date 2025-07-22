import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar as CalendarIcon, 
  Download, 
  Share2, 
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types';
import { ReportFilters, SalesReportData, ProductReportData } from '@/hooks/useSalesReports';
import { UpgradePrompt } from '@/components/UpgradePrompt';

interface SalesReportDialogProps {
  products: Product[];
  onGenerateReport: (filters: ReportFilters) => void;
  onExportCSV: (report: SalesReportData) => void;
  onShareReport: (report: SalesReportData) => void;
  generatedReport: SalesReportData | null;
  permissions: {
    canUseReporting: boolean;
    canDownloadReports: boolean;
    canShareReports: boolean;
    showUpgradePrompt: (feature: string) => boolean;
  };
}

export const SalesReportDialog: React.FC<SalesReportDialogProps> = ({
  products,
  onGenerateReport,
  onExportCSV,
  onShareReport,
  generatedReport,
  permissions
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: undefined,
    endDate: undefined,
    productId: 'all'
  });

  const handleGenerateReport = () => {
    onGenerateReport(filters);
  };

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setFilters(prev => ({ ...prev, startDate: date }));
    } else {
      setFilters(prev => ({ ...prev, endDate: date }));
    }
  };

  const resetFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      productId: 'all'
    });
  };

  const ProductSummaryCard: React.FC<{ product: ProductReportData }> = ({ product }) => (
    <Card className="border border-zimbabwe-green">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-zimbabwe-darkGreen flex items-center justify-between">
          <span>{product.productName}</span>
          <Badge variant={product.profitMargin > 20 ? "default" : "secondary"}>
            {product.profitMargin.toFixed(1)}% margin
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Sold:</span>
              <span className="font-medium">{product.totalQuantitySold}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discarded:</span>
              <span className="font-medium text-red-600">{product.totalQuantityDiscarded}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Sales Value:</span>
              <span className="font-medium">{formatPrice(product.totalSalesValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost Value:</span>
              <span className="font-medium">{formatPrice(product.totalCostValue)}</span>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="font-medium text-zimbabwe-darkGreen">Total Profit:</span>
          <span className="font-bold text-lg text-zimbabwe-darkGreen">
            {formatPrice(product.totalProfit)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Avg. Daily Profit:</span>
          <span>{formatPrice(product.averageDailyProfit)}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`${permissions.canUseReporting 
            ? 'border-zimbabwe-green text-zimbabwe-darkGreen hover:bg-zimbabwe-lightGreen' 
            : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!permissions.canUseReporting}
        >
          <FileText className="h-4 w-4 mr-2" />
          {t.salesAndProfit} Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-zimbabwe-darkGreen flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Report Generator
          </DialogTitle>
        </DialogHeader>

        {permissions.showUpgradePrompt('reporting') ? (
          <UpgradePrompt 
            feature="reporting" 
            description="Generate detailed sales reports with date filtering and export capabilities. Upgrade to premium to access comprehensive analytics."
          />
        ) : (
          <div className="space-y-6">
            {/* Filters Section */}
            <Card className="border border-zimbabwe-green">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Report Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate ? format(filters.startDate, 'PPP') : 'Select start date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.startDate}
                          onSelect={(date) => handleDateSelect(date, 'start')}
                          disabled={(date) => filters.endDate ? date > filters.endDate : false}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate ? format(filters.endDate, 'PPP') : 'Select end date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.endDate}
                          onSelect={(date) => handleDateSelect(date, 'end')}
                          disabled={(date) => filters.startDate ? date < filters.startDate : false}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Product Filter */}
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select 
                      value={filters.productId} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, productId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  <Button onClick={handleGenerateReport} className="bg-zimbabwe-green hover:bg-zimbabwe-darkGreen">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Report Display */}
            {generatedReport && (
              <div className="space-y-4">
                {/* Report Header */}
                <Card className="border-2 border-zimbabwe-green bg-zimbabwe-lightGreen/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold text-zimbabwe-darkGreen">
                          {generatedReport.reportTitle}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {generatedReport.dateRange} • Generated: {generatedReport.generatedAt}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onShareReport(generatedReport)}
                          disabled={!permissions.canShareReports && permissions.showUpgradePrompt('share_reports')}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onExportCSV(generatedReport)}
                          disabled={!permissions.canDownloadReports && permissions.showUpgradePrompt('download_reports')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-[400px] overflow-x-auto">
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-center mb-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600">Total Profit</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatPrice(generatedReport.totalProfit)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-center mb-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600">Total Sales</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice(generatedReport.totalSalesValue)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-center mb-2">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="text-lg font-bold text-gray-600">
                          {formatPrice(generatedReport.totalCostValue)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-center mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="text-sm text-gray-600">Discarded Value</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatPrice(generatedReport.totalDiscardedValue)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Details */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-zimbabwe-darkGreen">
                    Product Performance ({generatedReport.productReports.length} products)
                  </h3>
                  <div className="grid gap-4 overflow-x-auto">
                    <div className="min-w-[600px]">
                      {generatedReport.productReports.map(product => (
                        <div key={product.productId} className="mb-4">
                          <ProductSummaryCard product={product} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};