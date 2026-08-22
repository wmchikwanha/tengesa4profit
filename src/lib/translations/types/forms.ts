
export interface FormTranslations {
  // Form helpers
  optional?: string;
  calculate: string;
  currency: string;
  exchangeRate: string;
  enterExchangeRate: string;

  // Currency safeguards
  rateLastUpdated?: string;
  enteringPricesIn?: string;
  savedAtRate?: string;
  rateCheckTitle?: string;
  rateCheckBody?: string;
  rateCheckTo?: string;
  rateCheckQuestion?: string;
  rateCheckFix?: string;
  rateCheckConfirm?: string;
  rateStaleTitle?: string;
  rateStaleBody?: string;
  rateStaleNever?: string;
  updateRateNow?: string;
  dismissForToday?: string;
  realProfitUsd?: string;
  rateMovedNote?: string;

  cancel?: string;
  add?: string;
  
  // Form actions
  applyFilter: string;
  resetFilter: string;
  clearAllData: string;
  
  // Tooltips and instructions
  productInstructions?: string;
  tallyInstructions?: string;
}
