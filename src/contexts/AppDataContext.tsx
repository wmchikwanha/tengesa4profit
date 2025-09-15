import * as React from 'react';
import { Product } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export interface SalesRecord {
  date: string;
  products: Product[];
  totalProfit: number;
}

interface AppDataContextType {
  products: Product[];
  salesHistory: SalesRecord[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  clearAllData: () => void;
  clearSalesData: () => void;
  addToHistory: (date: string, productId: string, deltaSold: number, deltaDiscarded: number) => void;
}

const AppDataContext = React.createContext<AppDataContextType>({
  products: [],
  salesHistory: [],
  addProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},
  getProduct: () => undefined,
  clearAllData: () => {},
  clearSalesData: () => {},
  addToHistory: (..._args: any[]) => {},
});

export const useAppData = () => React.useContext(AppDataContext);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with empty arrays, then load from localStorage in useEffect
  const [products, setProducts] = React.useState<Product[]>([]);
  const [salesHistory, setSalesHistory] = React.useState<SalesRecord[]>([]);
  const [salesBaseline, setSalesBaseline] = React.useState<Record<string, { sold: number; discarded: number }>>({});
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const { user } = useAuth();
  
  // Helper function to get user-specific storage keys
  const getUserStorageKey = (key: string, userId: string | null) => {
    const uid = userId ?? 'guest';
    return `t4p:${uid}:${key}`;
  };

  React.useEffect(() => {
    const uid = user?.id ?? null;
    setCurrentUserId(uid);

    // Load user-specific products from localStorage
    try {
      const userProductsKey = getUserStorageKey('products', uid);
      const savedProducts = localStorage.getItem(userProductsKey);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to load products from localStorage:', error);
      setProducts([]);
    }

    // Load user-specific sales history from localStorage
    try {
      const userHistoryKey = getUserStorageKey('salesHistory', uid);
      const savedHistory = localStorage.getItem(userHistoryKey);
      if (savedHistory) {
        setSalesHistory(JSON.parse(savedHistory));
      } else {
        setSalesHistory([]);
      }
    } catch (error) {
      console.error('Failed to load sales history from localStorage:', error);
      setSalesHistory([]);
    }

    // Load user-specific sales baseline from localStorage (to avoid double-counting)
    try {
      const userBaselineKey = getUserStorageKey('salesBaseline', uid);
      const savedBaseline = localStorage.getItem(userBaselineKey);
      if (savedBaseline) {
        setSalesBaseline(JSON.parse(savedBaseline));
      } else {
        setSalesBaseline({});
      }
    } catch (error) {
      console.error('Failed to load sales baseline from localStorage:', error);
      setSalesBaseline({});
    }
  }, [user?.id]);

  React.useEffect(() => {
    // Persist products for the current context (user-specific if logged in, otherwise global)
    try {
      const key = getUserStorageKey('products', currentUserId);
      localStorage.setItem(key, JSON.stringify(products));
    } catch (error) {
      console.error('Failed to save products to localStorage:', error);
    }
  }, [products, currentUserId]);

  React.useEffect(() => {
    // Persist sales history for the current context
    try {
      const key = getUserStorageKey('salesHistory', currentUserId);
      localStorage.setItem(key, JSON.stringify(salesHistory));
    } catch (error) {
      console.error('Failed to save sales history to localStorage:', error);
    }
  }, [salesHistory, currentUserId]);

  // Persist sales baseline (to compute per-transaction deltas and avoid double counting)
  React.useEffect(() => {
    try {
      const key = getUserStorageKey('salesBaseline', currentUserId);
      localStorage.setItem(key, JSON.stringify(salesBaseline));
    } catch (error) {
      console.error('Failed to save sales baseline to localStorage:', error);
    }
  }, [salesBaseline, currentUserId]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => 
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getProduct = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const addToHistory = (date?: string) => {
    if (products.length === 0) return;

    // Use the provided date string (YYYY-MM-DD) as-is to avoid timezone shifts
    const todayFormatted = (date && /^\d{4}-\d{2}-\d{2}$/.test(date))
      ? date
      : new Date().toISOString().split('T')[0];

    // Compute per-product deltas since last baseline to avoid double counting
    const entries = products.map(product => {
      const baseline = salesBaseline[product.id] || { sold: 0, discarded: 0 };
      const deltaSold = (product.quantitySold || 0) - baseline.sold;
      const deltaDiscarded = (product.quantityDiscarded || 0) - baseline.discarded;
      return { product, deltaSold, deltaDiscarded };
    }).filter(e => e.deltaSold > 0 || e.deltaDiscarded > 0);

    if (entries.length === 0) return;

    // Calculate profit using ONLY the delta quantities
    const todayTotalProfit = entries.reduce((sum, { product, deltaSold }) => {
      const costPerUnit = product.buyingPrice + (product.transportCost / product.quantityBought) + (product.stallFee / product.quantityBought);
      const sellingPrice = product.sellingPrice || (costPerUnit * (1 + product.markupPercentage / 100));
      const profitPerUnit = sellingPrice - costPerUnit;
      return sum + (deltaSold * profitPerUnit);
    }, 0);

    setSalesHistory(prev => {
      const existingRecordIndex = prev.findIndex(record => record.date === todayFormatted);

      if (existingRecordIndex >= 0) {
        // Update today's record with running totals (not deltas)
        const existingRecord = prev[existingRecordIndex];
        const updatedProducts = [...existingRecord.products];

        entries.forEach(({ product, deltaSold, deltaDiscarded }) => {
          const idx = updatedProducts.findIndex(p => p.id === product.id);
          if (idx >= 0) {
            // Update with current absolute totals for the day
            updatedProducts[idx] = {
              ...updatedProducts[idx],
              quantitySold: product.quantitySold || 0,
              quantityDiscarded: product.quantityDiscarded || 0
            };
          } else {
            // Add new product with current absolute totals
            updatedProducts.push({
              ...JSON.parse(JSON.stringify(product)),
              quantitySold: product.quantitySold || 0,
              quantityDiscarded: product.quantityDiscarded || 0
            });
          }
        });

        // Recalculate total profit based on all products for the day
        const recalculatedProfit = updatedProducts.reduce((sum, historyProduct) => {
          const costPerUnit = historyProduct.buyingPrice + 
            (historyProduct.transportCost / historyProduct.quantityBought) + 
            (historyProduct.stallFee / historyProduct.quantityBought);
          const sellingPrice = historyProduct.sellingPrice || 
            (costPerUnit * (1 + historyProduct.markupPercentage / 100));
          const profitPerUnit = sellingPrice - costPerUnit;
          return sum + ((historyProduct.quantitySold || 0) * profitPerUnit);
        }, 0);

        const updatedRecord = {
          ...existingRecord,
          products: updatedProducts,
          totalProfit: recalculatedProfit
        };

        const newHistory = [...prev];
        newHistory[existingRecordIndex] = updatedRecord;
        return newHistory;
      } else {
        // Create new record for today with current absolute totals
        const productsCopy = entries.map(({ product }) => ({
          ...JSON.parse(JSON.stringify(product)),
          quantitySold: product.quantitySold || 0,
          quantityDiscarded: product.quantityDiscarded || 0
        }));

        // Calculate total profit for all products
        const totalProfitForDay = productsCopy.reduce((sum, historyProduct) => {
          const costPerUnit = historyProduct.buyingPrice + 
            (historyProduct.transportCost / historyProduct.quantityBought) + 
            (historyProduct.stallFee / historyProduct.quantityBought);
          const sellingPrice = historyProduct.sellingPrice || 
            (costPerUnit * (1 + historyProduct.markupPercentage / 100));
          const profitPerUnit = sellingPrice - costPerUnit;
          return sum + ((historyProduct.quantitySold || 0) * profitPerUnit);
        }, 0);

        const newRecord: SalesRecord = {
          date: todayFormatted,
          products: productsCopy,
          totalProfit: totalProfitForDay
        };
        return [...prev, newRecord];
      }
    });

    // Update baseline to the current absolute totals so next save captures only new deltas
    setSalesBaseline(prev => {
      const next = { ...prev };
      entries.forEach(({ product }) => {
        next[product.id] = {
          sold: product.quantitySold || 0,
          discarded: product.quantityDiscarded || 0
        };
      });
      return next;
    });

    console.log("History Saved: Today's sales deltas have been added to history");
  };

  const clearAllData = () => {
    // Clear everything including products and baselines
    setProducts([]);
    setSalesHistory([]);
    setSalesBaseline({});
  };

  const clearSalesData = () => {
    // Only clear sales data, preserve products but reset their sales quantities
    // Don't automatically add to history since we now do it per sale
    setProducts(prev => prev.map(product => ({
      ...product,
      quantitySold: 0,
      quantityDiscarded: 0
      // quantityBought, buyingPrice, transportCost, stallFee remain unchanged
    })));
  };

  return (
    <AppDataContext.Provider
      value={{
        products,
        salesHistory,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        clearAllData,
        clearSalesData,
        addToHistory,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export default AppDataProvider;
