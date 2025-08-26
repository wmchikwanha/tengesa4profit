
export type UnitOfMeasurement = 'bundle' | 'carton' | 'case' | 'centimetre' | 'container' | 'each' | 'gram' | 'kilogramme' | 'litre' | 'metre' | 'millilitre' | 'millimetre' | 'pack' | 'packet' | 'piece' | 'set' | 'ton';

export interface Product {
  id: string;
  name: string;
  supplier: string;
  purchaseDate?: string;
  saleDate?: string;
  quantityBought: number;
  unitOfMeasurement: UnitOfMeasurement;
  buyingPrice: number;
  transportCost: number;
  stallFee: number;
  markupPercentage: number;
  sellingPrice: number;
  quantitySold: number;
  quantityDiscarded: number;
  description?: string;
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
  
  // Stock calculation should use the actual stored quantities from the product
  const stockRemaining = Math.max(0, product.quantityBought - product.quantitySold - product.quantityDiscarded);
  
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
