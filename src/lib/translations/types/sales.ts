
export interface SalesTranslations {
  // Daily tally
  quantitySold: string;
  quantityDiscarded: string;
  stockRemaining: string;
  costPerUnit: string;
  profitPerUnit: string;
  dailyProfit: string;
  totalProfit: string;
  lowMargin: string;
  
  // Sales and costs
  totalSalesValue: string;
  totalCostValue: string;
  totalStockValue: string;
  salesValue?: string;
  costValue?: string;
  salesQty?: string;
  discardedQty?: string;
  discardedValue?: string;
  totalDiscardedQty?: string;
  totalDiscardedValue: string;
  totalDiscardedQuantity: string;
  
  // Sales history
  salesHistory: string;
  date: string;
  quantity: string;
  description?: string;
  noSalesHistory: string;
  viewHistory: string;
  hideHistory: string;
  
  // Sales page titles
  salesAndProfit: string;
  dateOfSale: string;
}
