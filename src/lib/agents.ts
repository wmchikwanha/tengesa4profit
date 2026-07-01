// Agentic prompt builders for Zim-ready quick agents.
// Each returns { prompt, transparency } — transparency is the exact data snapshot
// the AI will see, shown to the user in the Transparency Log.

import { calculateProduct, Product } from '@/lib/types';
import type { SalesRecord } from '@/contexts/AppDataContext';

export type AgentId = 'daily_closing' | 'restock_forecast' | 'negotiation_coach' | 'health_watchdog';

export interface AgentBuild {
  prompt: string;
  transparency: Record<string, unknown>;
  label: string;
}

const anonProducts = (products: Product[]) =>
  products.map((p) => {
    const c = calculateProduct(p);
    return {
      name: p.name,
      stockRemaining: c.stockRemaining,
      sold: p.quantitySold,
      profitPerUnit: Number(c.profitPerUnit.toFixed(2)),
    };
  });

export function buildDailyClosing(products: Product[], sales: SalesRecord[]): AgentBuild {
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.date === today);
  const revenue = todaySales.reduce((sum, s) => sum + s.products.reduce((a, b) => a + (b.sellingPrice * b.quantitySold), 0), 0);
  const profit = todaySales.reduce((sum, s) => sum + s.totalProfit, 0);
  const items = todaySales.reduce((sum, s) => sum + s.products.reduce((a, b) => a + b.quantitySold, 0), 0);

  const transparency = {
    date: today,
    totalRevenue: Number(revenue.toFixed(2)),
    totalProfit: Number(profit.toFixed(2)),
    itemsSold: items,
    productsSnapshot: anonProducts(products).slice(0, 20),
  };

  const prompt = `Act as my Daily Closing Agent. Here is today's data:\n${JSON.stringify(transparency, null, 2)}\n\nProvide: (1) today's revenue and profit summary in one line, (2) any discrepancy warnings (e.g. items with unusual movement), (3) a short restock list for tomorrow with quantities. Keep it under 150 words, plain English suitable for a street trader.`;

  return { prompt, transparency, label: 'Close today\'s books' };
}

export function buildRestockForecast(products: Product[], sales: SalesRecord[]): AgentBuild {
  const now = Date.now();
  const cutoff = now - 14 * 24 * 60 * 60 * 1000;
  const recent = sales.filter((s) => new Date(s.date).getTime() >= cutoff);

  const velocity: Record<string, number> = {};
  recent.forEach((s) => {
    s.products.forEach((p) => {
      velocity[p.name] = (velocity[p.name] || 0) + p.quantitySold;
    });
  });

  const forecast = products.map((p) => {
    const c = calculateProduct(p);
    const perDay = (velocity[p.name] || 0) / 14;
    const daysLeft = perDay > 0 ? c.stockRemaining / perDay : null;
    return {
      name: p.name,
      stockRemaining: c.stockRemaining,
      sold14d: velocity[p.name] || 0,
      dailyVelocity: Number(perDay.toFixed(2)),
      daysUntilStockout: daysLeft !== null ? Math.round(daysLeft) : 'no sales',
    };
  }).sort((a, b) => (typeof a.daysUntilStockout === 'number' ? a.daysUntilStockout : 999) - (typeof b.daysUntilStockout === 'number' ? b.daysUntilStockout : 999));

  const transparency = { windowDays: 14, forecast: forecast.slice(0, 15) };

  const prompt = `Act as my Restock Forecasting Agent. Based on 14-day sales velocity:\n${JSON.stringify(transparency, null, 2)}\n\nTell me: which 3-5 products I should restock this week and roughly how many units, and which are dead stock. Be direct and practical. Under 150 words.`;

  return { prompt, transparency, label: 'What should I buy?' };
}

export function buildNegotiationCoach(productName: string, supplierOffer: number, language: string): AgentBuild {
  const transparency = { productName, supplierOffer, language };
  const prompt = `Act as my Price Negotiation Coach. A supplier is offering "${productName}" at ${supplierOffer} per unit. Language: ${language}.\n\nGive me: (1) whether the offer sounds fair for a Zimbabwean street trader, (2) a realistic counter-offer, (3) a short negotiation script I can actually say — in ${language === 'sn' ? 'Shona' : language === 'nd' ? 'Ndebele' : 'English'}, polite but firm. Under 120 words.`;
  return { prompt, transparency, label: 'Help me negotiate' };
}

export function buildHealthWatchdog(products: Product[], sales: SalesRecord[]): AgentBuild {
  const totalStockValue = products.reduce((sum, p) => {
    const c = calculateProduct(p);
    return sum + c.stockRemaining * p.buyingPrice;
  }, 0);

  const last7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSales = sales.filter((s) => new Date(s.date).getTime() >= last7);
  const revenue7d = recentSales.reduce((sum, s) => sum + s.products.reduce((a, b) => a + b.sellingPrice * b.quantity, 0), 0);
  const profit7d = recentSales.reduce((sum, s) => sum + s.totalProfit, 0);

  const slowMovers = products.filter((p) => {
    const c = calculateProduct(p);
    return c.stockRemaining > 0 && p.quantitySold === 0;
  }).map((p) => p.name);

  const transparency = {
    totalStockValue: Number(totalStockValue.toFixed(2)),
    last7DaysRevenue: Number(revenue7d.toFixed(2)),
    last7DaysProfit: Number(profit7d.toFixed(2)),
    slowMovers: slowMovers.slice(0, 10),
    productCount: products.length,
  };

  const prompt = `Act as my Spoilage + Cash-Flow Watchdog. Here's my snapshot:\n${JSON.stringify(transparency, null, 2)}\n\nFlag: (1) cash-flow health (is stock tying up too much cash vs revenue?), (2) spoilage/slow-mover risk, (3) one concrete action I should take this week. Direct, plain English, under 120 words.`;

  return { prompt, transparency, label: 'Check my business health' };
}
