export type Language = 'en' | 'sn' | 'nd';

export interface TranslationDictionary {
  // App title and navigation
  appTitle: string;
  appName?: string;
  addProduct: string;
  tallyProfit: string;
  language: string;
  
  // Product entry
  productName: string;
  supplier: string;
  quantityBought: string;
  buyingPrice: string;
  unitPrice?: string;
  transportCost: string;
  stallFee: string;
  otherFees?: string;
  markupPercentage: string;
  desiredSellingPrice?: string;
  sellingPrice: string;
  save?: string;
  clear?: string;
  update?: string;
  clearForm?: string;
  newProduct?: string;
  
  // Daily tally
  quantitySold: string;
  quantityDiscarded: string;
  stockRemaining: string;
  costPerUnit: string;
  profitPerUnit: string;
  dailyProfit: string;
  totalProfit: string;
  lowMargin: string;
  
  // Results and alerts
  lowProfitWarning?: string;
  productsList?: string;
  noProducts?: string;
  loadProduct?: string;
  deleteProduct?: string;
  addDelivery?: string;
  addDeliveryPrompt?: string;
  enterQuantity?: string;
  cancel?: string;
  add?: string;
  confirmNegativeStock?: string;

  // Form helpers
  optional?: string;
  calculate: string;
  currency: string;
  exchangeRate: string;
  enterExchangeRate: string;
  
  // Tooltips
  productInstructions?: string;
  tallyInstructions?: string;
  
  // New features
  dailySummary?: string;
  productSummary?: string;
  totalStockValue: string;
  totalStockRemaining?: string;
  shareTally?: string;
  downloadReport?: string;
  viewHistory: string;
  hideHistory: string;
  clearAllData: string;
  confirmClearAll?: string;
  sold?: string;
  remaining?: string;
  history?: string;
  noHistory?: string;
  
  // Delete confirmation
  deleteConfirmation?: string;
  deleteWarning?: string;
  
  // Sales and costs
  totalSalesValue: string;
  totalCostValue: string;
  salesValue?: string;
  costValue?: string;
  salesQty?: string;
  discardedQty?: string;
  discardedValue?: string;
  totalDiscardedQty?: string;
  totalDiscardedValue: string;
  totalDiscardedQuantity: string;
  
  // Date filtering
  selectDateRange?: string;
  startDate?: string;
  endDate?: string;
  reset?: string;
  apply?: string;
  noMatchingHistory?: string;
  
  // Additional fields
  selectProduct: string;
  date: string;
  quantity: string;
  description?: string;
  noSalesHistory: string;
  applyFilter: string;
  resetFilter: string;
  salesHistory: string;

  // Authentication
  login: string;
  signUp: string;
  email: string;
  phoneNumber: string;
  password: string;
  enterEmail: string;
  enterPassword: string;
  phoneExample: string;
  loading: string;
  
  // Terms and Conditions
  termsAndConditions: string;
  agreeToTerms: string;
  acceptanceOfTerms: string;
  acceptanceText: string;
  trialPeriod: string;
  trialText: string;
  subscriptionTerms: string;
  subscriptionText: string;
  paymentTerms: string;
  paymentText: string;
  privacyPolicy: string;
  privacyText: string;
  termination: string;
  terminationText: string;
  
  // Trial Status
  freeTrial: string;
  daysLeft: string;
  gracePeriod: string;
  gracePeriodMessage: string;
  trialExpired: string;
  trialMessage: string;
  upgradeNow: string;
  upgradeToBasic: string;
  month: string;
  
  // Payment
  selectPaymentMethod: string;
  pay: string;
  processing: string;
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
  enterCardholderName: string;
  ecocashNumber: string;
  ecocashInstructions: string;
  mobileNumber: string;
  paynowInstructions: string;
  paypalEmail: string;
  paypalInstructions: string;
  
  // Success Messages
  welcomeMessage: string;
  paymentSuccess: string;
  subscriptionActive: string;
  continueToApp: string;
  upgradeAccount: string;
  upgradeMessage: string;
  
  // Auth Flow
  noAccount: string;
  haveAccount: string;
}
