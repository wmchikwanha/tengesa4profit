
export type UnitOfMeasurement = 'bundle' | 'carton' | 'case' | 'centimetre' | 'container' | 'each' | 'gram' | 'kilogramme' | 'litre' | 'metre' | 'millilitre' | 'millimetre' | 'pack' | 'packet' | 'piece' | 'set' | 'ton';

export type Currency = 'USD' | 'ZWL';

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
  /** Currency the prices above were typed in. Defaults to USD for older records. */
  entryCurrency?: Currency;
  /** ZWL per 1 USD at the moment the prices were typed. Defaults to 1. */
  entryRate?: number;
}

export interface ProductCalculation {
  costPerUnit: number;
  sellingPrice: number;
  profitPerUnit: number;
  stockRemaining: number;
  dailyProfit: number;
  lowMargin: boolean;
}

export interface CurrencySettings {
  currentCurrency: Currency;
  exchangeRate: number; // ZWL per 1 USD
  rateUpdatedAt?: string; // ISO date string of the last rate change
  previousRate?: number;
}

/** Turn an amount typed in a given currency into the USD base used for all maths. */
export const toBaseUsd = (amount: number, currency?: Currency, rate?: number): number => {
  if (currency === 'ZWL' && rate && rate > 0) return amount / rate;
  return amount;
};

/** Turn a USD base amount back into a given currency. */
export const fromBaseUsd = (usd: number, currency?: Currency, rate?: number): number => {
  if (currency === 'ZWL' && rate && rate > 0) return usd * rate;
  return usd;
};

/**
 * All product maths happens in a single USD base so that prices typed in ZWL
 * at an old rate are never double-converted when the rate moves.
 */
export const calculateProduct = (product: Product): ProductCalculation => {
  const base = (amount: number) => toBaseUsd(amount || 0, product.entryCurrency, product.entryRate);

  const buyingPrice = base(product.buyingPrice);
  const transportCost = base(product.transportCost);
  const stallFee = base(product.stallFee);
  const quantityBought = product.quantityBought || 1;

  const costPerUnit =
    buyingPrice +
    (transportCost / quantityBought) +
    (stallFee / quantityBought);

  let sellingPrice = base(product.sellingPrice);
  if (!sellingPrice) {
    // Calculate selling price based on markup
    sellingPrice = costPerUnit * (1 + product.markupPercentage / 100);
  }

  const profitPerUnit = sellingPrice - costPerUnit;

  // Stock calculation should use the actual stored quantities from the product
  const stockRemaining = Math.max(0, product.quantityBought - product.quantitySold - product.quantityDiscarded);

  const dailyProfit = product.quantitySold * profitPerUnit;

  // Determine if the profit margin is low (less than 5%)
  const profitMargin = sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0;
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
