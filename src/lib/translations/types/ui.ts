
export interface UITranslations {
  // Results and alerts
  lowProfitWarning?: string;
  productsList?: string;
  noProducts?: string;
  loadProduct?: string;
  deleteProduct?: string;
  addDelivery?: string;
  addDeliveryPrompt?: string;
  enterQuantity?: string;
  confirmNegativeStock?: string;

  // Delete confirmation
  deleteConfirmation?: string;
  deleteWarning?: string;
  confirmClearAll?: string;
  
  // Summary and reports
  dailySummary?: string;
  productSummary?: string;
  totalStockRemaining?: string;
  shareTally?: string;
  downloadReport?: string;
  sold?: string;
  remaining?: string;
  history?: string;
  noHistory?: string;
  
  // Date filtering
  selectDateRange?: string;
  startDate?: string;
  endDate?: string;
  reset?: string;
  apply?: string;
  noMatchingHistory?: string;
  
  // Additional UI fields
  dateOfPurchase: string;
  unit: string;
  unitPriceDollar: string;
  yourProductsColumn: string;
  stockQty: string;
  actions: string;
  stockValue: string;
  
  // Category translations
  vegetables: string;
  fruits: string;
  grains: string;
  dairy: string;
  meat: string;
  beverages: string;
  snacks: string;
  household: string;
  clothing: string;
  electronics: string;
  tools: string;
  books: string;
  other: string;
  livestock: string;
  produce: string;
  condiments: string;
  industrial: string;
  
  // Premium benefits
  premiumBenefits: string[];
  
  // Additional UI translations
  allCategories?: string;
  productDescription?: string;
  totalProfitAllTime?: string;
  stockValueOnHand?: string;
  
  // About dialog translations
  aboutTagline?: string;
  aboutProductMgmt?: string;
  aboutProductMgmtDesc?: string;
  aboutProfitCalc?: string;
  aboutProfitCalcDesc?: string;
  aboutMarketplace?: string;
  aboutMarketplaceDesc?: string;
  aboutMultiLang?: string;
  aboutMultiLangDesc?: string;
  aboutFooter?: string;
}
