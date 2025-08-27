import { useState } from 'react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay, isEqual } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionPermissions } from '@/hooks/useSubscriptionPermissions';
import { Product, calculateProduct } from '@/lib/types';
import { SalesRecord } from '@/contexts/AppDataContext';

export interface ReportFilters {
  startDate: Date | undefined;
  endDate: Date | undefined;
  productId: string | 'all';
}

export interface ProductReportData {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalQuantityDiscarded: number;
  totalProfit: number;
  totalSalesValue: number;
  totalCostValue: number;
  totalDiscardedValue: number;
  averageDailyProfit: number;
  profitMargin: number;
}

export interface SalesReportData {
  reportTitle: string;
  dateRange: string;
  totalProfit: number;
  totalSalesValue: number;
  totalCostValue: number;
  totalDiscardedValue: number;
  productReports: ProductReportData[];
  generatedAt: string;
}

export function useSalesReports(salesHistory: SalesRecord[], products: Product[]) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const permissions = useSubscriptionPermissions();
  
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    startDate: undefined,
    endDate: undefined,
    productId: 'all'
  });
  const [generatedReport, setGeneratedReport] = useState<SalesReportData | null>(null);

  const generateReport = (filters: ReportFilters): SalesReportData => {
    // Filter sales history by date range
    let filteredHistory = salesHistory;
    
    if (filters.startDate || filters.endDate) {
      filteredHistory = salesHistory.filter(record => {
        const recordDate = parseISO(record.date);
        
        if (filters.startDate && filters.endDate) {
          return (
            (isAfter(recordDate, startOfDay(filters.startDate)) || isEqual(recordDate, filters.startDate)) && 
            (isBefore(recordDate, endOfDay(filters.endDate)) || isEqual(recordDate, filters.endDate))
          );
        }
        
        if (filters.startDate && !filters.endDate) {
          return isAfter(recordDate, startOfDay(filters.startDate)) || isEqual(recordDate, filters.startDate);
        }
        
        if (!filters.startDate && filters.endDate) {
          return isBefore(recordDate, endOfDay(filters.endDate)) || isEqual(recordDate, filters.endDate);
        }
        
        return true;
      });
    }

    // Debug: Log the sales history being processed - now exclude detailed logs
    console.log('Sales history summary:', { 
      totalRecords: salesHistory.length, 
      filteredRecords: filteredHistory.length,
      datesWithData: filteredHistory.map(r => r.date)
    });

    // Get all products from filtered history  
    const allProductsInHistory = new Map<string, Product[]>();
    filteredHistory.forEach(record => {
      record.products.forEach(product => {
        // Only include products that have actual sales or discarded quantities
        if ((product.quantitySold || 0) > 0 || (product.quantityDiscarded || 0) > 0) {
          if (!allProductsInHistory.has(product.id)) {
            allProductsInHistory.set(product.id, []);
          }
          allProductsInHistory.get(product.id)!.push(product);
        }
      });
    });

    console.log('Products found in history:', Array.from(allProductsInHistory.keys()));

    // Calculate aggregated data per product
    const productReports: ProductReportData[] = [];
    
    allProductsInHistory.forEach((productInstances, productId) => {
      // Filter by product if specified
      if (filters.productId !== 'all' && productId !== filters.productId) {
        return;
      }

      const firstInstance = productInstances[0];
      let totalQuantitySold = 0;
      let totalQuantityDiscarded = 0;
      let totalProfit = 0;
      let totalSalesValue = 0;
      let totalCostValue = 0;
      let totalDiscardedValue = 0;

      productInstances.forEach(product => {
        const calc = calculateProduct(product);
        totalQuantitySold += product.quantitySold || 0;
        totalQuantityDiscarded += product.quantityDiscarded || 0;
        totalProfit += calc.dailyProfit;
        totalSalesValue += (product.quantitySold || 0) * calc.sellingPrice;
        totalCostValue += (product.quantitySold || 0) * calc.costPerUnit;
        totalDiscardedValue += (product.quantityDiscarded || 0) * calc.costPerUnit;
      });

      const averageDailyProfit = productInstances.length > 0 ? totalProfit / productInstances.length : 0;
      // Use the actual markup percentage from the product instead of calculating margin
      const profitMargin = firstInstance.markupPercentage;

      productReports.push({
        productId,
        productName: firstInstance.name,
        totalQuantitySold,
        totalQuantityDiscarded,
        totalProfit,
        totalSalesValue,
        totalCostValue,
        totalDiscardedValue,
        averageDailyProfit,
        profitMargin
      });
    });

    // Calculate overall totals
    const overallTotals = productReports.reduce(
      (acc, product) => ({
        totalProfit: acc.totalProfit + product.totalProfit,
        totalSalesValue: acc.totalSalesValue + product.totalSalesValue,
        totalCostValue: acc.totalCostValue + product.totalCostValue,
        totalDiscardedValue: acc.totalDiscardedValue + product.totalDiscardedValue
      }),
      { totalProfit: 0, totalSalesValue: 0, totalCostValue: 0, totalDiscardedValue: 0 }
    );

    // Create date range string
    let dateRange = '';
    if (filters.startDate && filters.endDate) {
      dateRange = `${format(filters.startDate, 'PPP')} - ${format(filters.endDate, 'PPP')}`;
    } else if (filters.startDate) {
      dateRange = `From ${format(filters.startDate, 'PPP')}`;
    } else if (filters.endDate) {
      dateRange = `Until ${format(filters.endDate, 'PPP')}`;
    } else {
      dateRange = 'All Time';
    }

    const reportTitle = filters.productId === 'all' 
      ? 'Complete Sales Report'
      : `Sales Report - ${products.find(p => p.id === filters.productId)?.name || 'Unknown Product'}`;

    return {
      reportTitle,
      dateRange,
      ...overallTotals,
      productReports: productReports.sort((a, b) => b.totalProfit - a.totalProfit),
      generatedAt: format(new Date(), 'PPP pp')
    };
  };

  const handleGenerateReport = (filters: ReportFilters) => {
    if (!permissions.canUseReporting) {
      toast({
        title: "Premium Feature",
        description: "Sales reports are available in premium subscription",
        variant: "destructive"
      });
      return;
    }

    try {
      const report = generateReport(filters);
      setGeneratedReport(report);
      setReportFilters(filters);
      
      toast({
        title: "Success",
        description: "Sales report generated successfully"
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate sales report",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = (report: SalesReportData) => {
    if (!permissions.canDownloadReports) {
      toast({
        title: "Premium Feature",
        description: "Report downloads are available in premium subscription",
        variant: "destructive"
      });
      return;
    }

    try {
      const csvHeaders = [
        'Product Name',
        'Quantity Sold',
        'Quantity Discarded', 
        'Total Profit',
        'Total Sales Value',
        'Total Cost Value',
        'Total Discarded Value',
        'Average Daily Profit',
        'Profit Margin (%)'
      ];

      const csvRows = report.productReports.map(product => [
        product.productName,
        product.totalQuantitySold.toString(),
        product.totalQuantityDiscarded.toString(),
        product.totalProfit.toFixed(2),
        product.totalSalesValue.toFixed(2),
        product.totalCostValue.toFixed(2),
        product.totalDiscardedValue.toFixed(2),
        product.averageDailyProfit.toFixed(2),
        product.profitMargin.toFixed(2)
      ]);

      const csvContent = [
        [`${report.reportTitle}`],
        [`Date Range: ${report.dateRange}`],
        [`Generated: ${report.generatedAt}`],
        [],
        [`Summary Totals`],
        [`Total Profit: ${formatPrice(report.totalProfit)}`],
        [`Total Sales Value: ${formatPrice(report.totalSalesValue)}`],
        [`Total Cost Value: ${formatPrice(report.totalCostValue)}`],
        [`Total Discarded Value: ${formatPrice(report.totalDiscardedValue)}`],
        [],
        csvHeaders,
        ...csvRows
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Report downloaded as CSV"
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: "Error", 
        description: "Failed to export report",
        variant: "destructive"
      });
    }
  };

  const shareReport = async (report: SalesReportData) => {
    if (!permissions.canShareReports) {
      toast({
        title: "Premium Feature",
        description: "Report sharing is available in premium subscription",
        variant: "destructive"
      });
      return;
    }

    try {
      const reportText = `${report.reportTitle}\n${report.dateRange}\n\nTotal Profit: ${formatPrice(report.totalProfit)}\nTotal Sales: ${formatPrice(report.totalSalesValue)}\n\nTop Products:\n${report.productReports.slice(0, 3).map(p => `• ${p.productName}: ${formatPrice(p.totalProfit)}`).join('\n')}`;

      if (navigator.share) {
        await navigator.share({
          title: report.reportTitle,
          text: reportText
        });
        
        toast({
          title: "Success",
          description: "Report shared successfully"
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(reportText);
        toast({
          title: "Copied",
          description: "Report summary copied to clipboard"
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Error",
        description: "Failed to share report",
        variant: "destructive"
      });
    }
  };

  return {
    isReportDialogOpen,
    setIsReportDialogOpen,
    reportFilters,
    generatedReport,
    handleGenerateReport,
    exportToCSV,
    shareReport,
    permissions
  };
}