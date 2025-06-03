
import { TranslationDictionary } from './types';

export const enTranslations: TranslationDictionary = {
  // App title and navigation
  appTitle: 'Zim Market Trader',
  addProduct: 'Add Product',
  tallyProfit: 'Tally & Profit',
  language: 'Language',
  
  // Product entry
  productName: 'Product Name',
  supplier: 'Supplier',
  quantityBought: 'Quantity Bought',
  buyingPrice: 'Buying Price (per unit)',
  transportCost: 'Transport Cost',
  otherFees: 'Other Fees (stall, parking, rates, etc.)',
  markupPercentage: 'Markup %',
  desiredSellingPrice: 'Selling Price',
  save: 'Save',
  clear: 'Clear',
  update: 'Update',
  clearForm: 'Clear Form',
  newProduct: 'Add New Product',
  selectProduct: 'Select Product',
  
  // Daily tally
  quantitySold: 'Quantity Sold',
  quantityDiscarded: 'Quantity Discarded',
  stockRemaining: 'Stock Remaining',
  costPerUnit: 'Cost Per Unit',
  sellingPrice: 'Selling Price',
  profitPerUnit: 'Profit Per Unit',
  dailyProfit: 'Daily Profit',
  totalProfit: 'Total Profit',
  
  // Results and alerts
  lowProfitWarning: 'Warning: Low profit margin!',
  productsList: 'Your Products',
  noProducts: 'No products yet. Add some!',
  loadProduct: 'Select',
  deleteProduct: 'Delete',
  addDelivery: 'Add Stock',
  addDeliveryPrompt: 'Add Stock',
  enterQuantity: 'Enter quantity to add:',
  cancel: 'Cancel',
  add: 'Add',
  confirmNegativeStock: 'Warning: You are selling more than your available stock. Allow negative stock?',

  // Form helpers
  optional: 'optional',
  calculate: 'Calculate',
  currency: '$',
  
  // Tooltips
  productInstructions: 'Enter your product details here. You can add as many products as you want. After saving, you can select a product to edit it.',
  tallyInstructions: 'Select a product, enter how many items you sold and/or discarded, then calculate your profits.',
  
  // New features
  dailySummary: 'Daily Summary',
  productSummary: 'Product Sales Summary',
  totalStockValue: 'Total Stock Value',
  totalStockRemaining: 'Total Stock Remaining',
  shareTally: 'Share Report',
  downloadReport: 'Download PDF',
  viewHistory: 'View History',
  hideHistory: 'Hide History',
  clearAllData: 'End Day & Clear All',
  confirmClearAll: 'Are you sure you want to clear all data? This cannot be undone!',
  sold: 'Sold',
  remaining: 'Left',
  history: 'Sales History',
  noHistory: 'No history available',
  
  // Delete confirmation
  deleteConfirmation: 'Confirm Delete',
  deleteWarning: 'Are you sure you want to delete this product? This cannot be undone!',
  
  // Sales and costs
  totalSalesValue: 'Total Sales Value',
  totalCostValue: 'Total Cost Value',
  salesValue: 'Sales Value',
  costValue: 'Cost Value',
  salesQty: 'Total Sales Quantity',
  discardedQty: 'Total Discarded Quantity',
  discardedValue: 'Discarded Value',
  totalDiscardedQty: 'Total Discarded Quantity',
  totalDiscardedValue: 'Total Discarded Value',
  
  // Date filtering
  selectDateRange: 'Select date range',
  startDate: 'Start Date',
  endDate: 'End Date',
  reset: 'Reset',
  apply: 'Apply',
  noMatchingHistory: 'No matching history for selected dates',
};
