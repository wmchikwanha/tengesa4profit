
export type UnitOfMeasurement = 'each' | 'gram' | 'kg' | 'ton' | 'cm' | 'mm' | 'metre' | 'inch' | 'litre' | 'ml' | 'pint' | 'gallon' | 'cup' | 'bucket' | 'bunch' | 'pack' | 'packet' | 'piece' | 'length' | 'mg' | 'pair' | 'container';

export interface Product {
  id: string;
  name: string;
  supplier: string;
  quantityBought: number;
  unitOfMeasurement: UnitOfMeasurement;
  buyingPrice: number;
  transportCost: number;
  stallFee: number;
  markupPercentage: number;
  sellingPrice: number;
  quantitySold: number;
  quantityDiscarded: number;
}

export interface ProductCalculation {
  costPerUnit: number;
  sellingPrice: number;
  profitPerUnit: number;
  stockRemaining: number;
  dailyProfit: number;
  lowMargin: boolean;
}

export type Currency = 'USD' | 'ZWL';

export interface CurrencySettings {
  currentCurrency: Currency;
  exchangeRate: number; // ZWL per 1 USD
}

export const calculateProduct = (product: Product): ProductCalculation => {
  const costPerUnit = 
    product.buyingPrice + 
    (product.transportCost / product.quantityBought) + 
    (product.stallFee / product.quantityBought);
  
  let sellingPrice = product.sellingPrice;
  if (!sellingPrice) {
    // Calculate selling price based on markup
    sellingPrice = costPerUnit * (1 + product.markupPercentage / 100);
  }
  
  const profitPerUnit = sellingPrice - costPerUnit;
  
  // Fix stock calculation issue - don't reset stock when selling remaining items
  const stockRemaining = product.quantityBought - (product.quantitySold + product.quantityDiscarded);
  
  const dailyProfit = product.quantitySold * profitPerUnit;
  
  // Determine if the profit margin is low (less than 5%)
  const profitMargin = (profitPerUnit / sellingPrice) * 100;
  const lowMargin = profitMargin < 5;
  
  return {
    costPerUnit,
    sellingPrice,
    profitPerUnit,
    stockRemaining,
    dailyProfit,
    lowMargin,
  };
};
