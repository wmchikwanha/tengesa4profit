
export type Language = 'en' | 'sn' | 'nd';

export interface TranslationDictionary {
  // App title and navigation
  appTitle: string;
  addProduct: string;
  tallyProfit: string;
  language: string;
  
  // Product entry
  productName: string;
  quantityBought: string;
  buyingPrice: string;
  transportCost: string;
  otherFees: string;
  markupPercentage: string;
  desiredSellingPrice: string;
  save: string;
  clear: string;
  update: string;
  clearForm: string;
  newProduct: string;
  
  // Daily tally
  quantitySold: string;
  quantityDiscarded: string;
  stockRemaining: string;
  costPerUnit: string;
  sellingPrice: string;
  profitPerUnit: string;
  dailyProfit: string;
  totalProfit: string;
  
  // Results and alerts
  lowProfitWarning: string;
  productsList: string;
  noProducts: string;
  loadProduct: string;
  deleteProduct: string;
  addDelivery: string;
  addDeliveryPrompt: string;
  enterQuantity: string;
  cancel: string;
  add: string;
  confirmNegativeStock: string;

  // Form helpers
  optional: string;
  calculate: string;
  currency: string;
  
  // Tooltips
  productInstructions: string;
  tallyInstructions: string;
  
  // New features
  dailySummary: string;
  productSummary: string;
  totalStockValue: string;
  totalStockRemaining: string;
  shareTally: string;
  downloadReport: string;
  viewHistory: string;
  hideHistory: string;
  clearAllData: string;
  confirmClearAll: string;
  sold: string;
  remaining: string;
  history: string;
  noHistory: string;
  
  // Delete confirmation
  deleteConfirmation: string;
  deleteWarning: string;
  
  // Sales and costs
  totalSalesValue: string;
  totalCostValue: string;
  salesValue: string;
  costValue: string;
  salesQty: string;
  discardedQty: string;
  discardedValue: string;
  totalDiscardedQty: string;
  totalDiscardedValue: string;
  
  // Date filtering
  selectDateRange: string;
  startDate: string;
  endDate: string;
  reset: string;
  apply: string;
  noMatchingHistory: string;
}
