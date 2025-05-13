
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
  shareTally: string;
  downloadReport: string;
  viewHistory: string;
  hideHistory: string;
  clearAllData: string;
  confirmClearAll: string;
  sold: string;
  remaining: string;
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
    update: 'Update',
    clearForm: 'Clear Form',
    newProduct: 'Add New Product',
    
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
    shareTally: 'Share Report',
    downloadReport: 'Download PDF',
    viewHistory: 'View History',
    hideHistory: 'Hide History',
    clearAllData: 'End Day & Clear All',
    confirmClearAll: 'Are you sure you want to clear all data? This cannot be undone!',
    sold: 'Sold',
    remaining: 'Left',
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
    update: 'Chinja',
    clearForm: 'Dzima Fomu',
    newProduct: 'Wedzera Chimwe Chigadzirwa',
    
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
    addDelivery: 'Wedzera Stock',

    // Form helpers
    optional: 'hazvina kukosha',
    calculate: 'Verengera',
    currency: '$',
    
    // Tooltips
    productInstructions: 'Isa zvigadzirwa zvako pano. Unogona kuwedzera zvigadzirwa zvakawanda. Kana wachengetedza, unokwanisa kusarudza chigadzirwa kuchinja.',
    tallyInstructions: 'Sarudza chigadzirwa, isa huwandu hwawakatengesera uye/kana hwakarasika, wobva waverengera purofiti yako.',
    
    // New features
    dailySummary: 'Zvebasa Rezuva',
    productSummary: 'Zvigadzirwa Zvatengeswa',
    totalStockValue: 'Mari yeZvigadzirwa Zvose',
    shareTally: 'Tumira Ripoti',
    downloadReport: 'Dhaunirodha PDF',
    viewHistory: 'Tarira Zvakaitwa',
    hideHistory: 'Viga Zvakaitwa',
    clearAllData: 'Pedza Zuva & Dzima Zvose',
    confirmClearAll: 'Chokwadi unoda kudzima zvose? Izvi hazvigoni kudzoswa!',
    sold: 'Zvatengeswa',
    remaining: 'Zvakasara',
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
    update: 'Buyekeza',
    clearForm: 'Sula Ifomu',
    newProduct: 'Enga Impahla Entsha',
    
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
    addDelivery: 'Engeza Stock',

    // Form helpers
    optional: 'okungeyisiyo impoqo',
    calculate: 'Bala',
    currency: '$',
    
    // Tooltips
    productInstructions: 'Faka imininingwane yempahla yakho lapha. Ungafaka impahla eminingi ngokuthanda kwakho. Ngemva kokulondoloza, ungakhetha impahla ukuze uyilungise.',
    tallyInstructions: 'Khetha impahla, faka inani othengise ngalo kanye/noma elilahlekile, bese ubala inzuzo yakho.',
    
    // New features
    dailySummary: 'Isifinyezo Sosuku',
    productSummary: 'Isifinyezo Sempahla Ethengisiwe',
    totalStockValue: 'Intengo Yempahla Yonke',
    shareTally: 'Thumela Umbiko',
    downloadReport: 'Landa iPDF',
    viewHistory: 'Bona Umlando',
    hideHistory: 'Fihla Umlando',
    clearAllData: 'Qeda Usuku & Sula Konke',
    confirmClearAll: 'Uqinisekile ukuthi ufuna ukusula konke? Lokhu ngeke kuphindwe futhi!',
    sold: 'Ethengisiwe',
    remaining: 'Esele',
  }
};
