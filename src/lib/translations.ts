
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
  stallFee: string;
  markupPercentage: string;
  desiredSellingPrice: string;
  save: string;
  clear: string;
  
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

  // Form helpers
  optional: string;
  calculate: string;
  currency: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    // App title and navigation
    appTitle: 'Trader Profit Buddy',
    addProduct: 'Add Product',
    tallyProfit: 'Tally & Profit',
    language: 'Language',
    
    // Product entry
    productName: 'Product Name',
    quantityBought: 'Quantity Bought',
    buyingPrice: 'Buying Price (per unit)',
    transportCost: 'Transport Cost',
    stallFee: 'Stall Fee',
    markupPercentage: 'Markup %',
    desiredSellingPrice: 'Selling Price',
    save: 'Save',
    clear: 'Clear',
    
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

    // Form helpers
    optional: 'optional',
    calculate: 'Calculate',
    currency: '$',
  },
  sn: {
    // App title and navigation
    appTitle: 'Shamwari yeMutengo',
    addProduct: 'Wedzera Zvigadzirwa',
    tallyProfit: 'Verenga & Purofiti',
    language: 'Mutauro',
    
    // Product entry
    productName: 'Zita reChigadzirwa',
    quantityBought: 'Huwandu Hwakatenga',
    buyingPrice: 'Mutengo wekutenga (pahuwandu)',
    transportCost: 'Mari yeTransport',
    stallFee: 'Mari yeStall',
    markupPercentage: 'Markup %',
    desiredSellingPrice: 'Mutengo wekutengesa',
    save: 'Chengetedza',
    clear: 'Dzima',
    
    // Daily tally
    quantitySold: 'Huwandu Hwakatengeswa',
    quantityDiscarded: 'Huwandu Hwakarasika',
    stockRemaining: 'Zvakasara',
    costPerUnit: 'Mutengo pane chimwe',
    sellingPrice: 'Mutengo wekutengesa',
    profitPerUnit: 'Purofiti pane chimwe',
    dailyProfit: 'Purofiti yeZuva',
    totalProfit: 'Purofiti Yose',
    
    // Results and alerts
    lowProfitWarning: 'Yambiro: Purofiti idiki!',
    productsList: 'Zvigadzirwa Zvako',
    noProducts: 'Hapana zvigadzirwa. Wedzera zvimwe!',
    loadProduct: 'Sarudza',
    deleteProduct: 'Dzima',

    // Form helpers
    optional: 'hazvina kukosha',
    calculate: 'Verengera',
    currency: '$',
  },
  nd: {
    // App title and navigation
    appTitle: 'Umngane Wentengo',
    addProduct: 'Faka Impahla',
    tallyProfit: 'Bala & Inzuzo',
    language: 'Ulimi',
    
    // Product entry
    productName: 'Ibizo Lempahla',
    quantityBought: 'Inani Elithengiweyo',
    buyingPrice: 'Intengo yokuThenga (ngenani)',
    transportCost: 'Imali Yokuhamba',
    stallFee: 'Imali Yendawo',
    markupPercentage: 'Markup %',
    desiredSellingPrice: 'Intengo yokuthengisa',
    save: 'Londoloza',
    clear: 'Sula',
    
    // Daily tally
    quantitySold: 'Inani Elithengisiweyo',
    quantityDiscarded: 'Inani Elilahlekileyo',
    stockRemaining: 'Isetshenziswe',
    costPerUnit: 'Intengo ngenye',
    sellingPrice: 'Intengo yokuthengisa',
    profitPerUnit: 'Inzuzo ngenye',
    dailyProfit: 'Inzuzo Yosuku',
    totalProfit: 'Inzuzo Iphelele',
    
    // Results and alerts
    lowProfitWarning: 'Isexwayiso: Inzuzo incane!',
    productsList: 'Impahla Yakho',
    noProducts: 'Akukho mpahla. Engeza ezinye!',
    loadProduct: 'Khetha',
    deleteProduct: 'Sula',

    // Form helpers
    optional: 'okungeyisiyo impoqo',
    calculate: 'Bala',
    currency: '$',
  }
};
