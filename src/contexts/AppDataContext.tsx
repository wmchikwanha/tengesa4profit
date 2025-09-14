import * as React from 'react';
import { Product } from '@/lib/types';

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
  addToHistory: () => void;
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
  addToHistory: () => {},
});

export const useAppData = () => React.useContext(AppDataContext);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with empty arrays, then load from localStorage in useEffect
  const [products, setProducts] = React.useState<Product[]>([]);
  const [salesHistory, setSalesHistory] = React.useState<SalesRecord[]>([]);
  const [salesBaseline, setSalesBaseline] = React.useState<Record<string, { sold: number; discarded: number }>>({});
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  // Helper function to get user-specific storage keys
  const getUserStorageKey = (key: string, userId: string | null) => {
    return key; // Use global keys to ensure persistence across refresh/login
  };

  React.useEffect(() => {
    // Get current user ID from auth context
    const getCurrentUserId = () => {
      try {
        // Try to get user from various possible auth storage locations
        const authKeys = Object.keys(localStorage).filter(key => 
          key.includes('supabase.auth') && key.includes('user')
        );
        
        for (const key of authKeys) {
          try {
            const authData = JSON.parse(localStorage.getItem(key) || '{}');
            if (authData.user?.id) {
              return authData.user.id;
            }
          } catch (e) {
            continue;
          }
        }
        return null;
      } catch (error) {
        return null;
      }
    };

    const userId = getCurrentUserId();
    setCurrentUserId(userId);

    // Load user-specific products from localStorage
    try {
      const userProductsKey = getUserStorageKey('products', userId);
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
      const userHistoryKey = getUserStorageKey('salesHistory', userId);
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
      const userBaselineKey = getUserStorageKey('salesBaseline', userId);
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
  }, []);

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

  const addToHistory = () => {
    if (products.length === 0) return;

    const todayFormatted = new Date().toISOString().split('T')[0];

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
        // Merge deltas into today's record
        const existingRecord = prev[existingRecordIndex];
        const updatedProducts = [...existingRecord.products];

        entries.forEach(({ product, deltaSold, deltaDiscarded }) => {
          const idx = updatedProducts.findIndex(p => p.id === product.id);
          if (idx >= 0) {
            const existingProduct = updatedProducts[idx];
            updatedProducts[idx] = {
              ...existingProduct,
              quantitySold: (existingProduct.quantitySold || 0) + deltaSold,
              quantityDiscarded: (existingProduct.quantityDiscarded || 0) + deltaDiscarded
            };
          } else {
            // Store only the delta quantities in history
            updatedProducts.push({
              ...JSON.parse(JSON.stringify(product)),
              quantitySold: deltaSold,
              quantityDiscarded: deltaDiscarded
            });
          }
        });

        const updatedRecord = {
          ...existingRecord,
          products: updatedProducts,
          totalProfit: existingRecord.totalProfit + todayTotalProfit
        };

        const newHistory = [...prev];
        newHistory[existingRecordIndex] = updatedRecord;
        return newHistory;
      } else {
        // Create new record for today with delta quantities only
        const productsCopy = entries.map(({ product, deltaSold, deltaDiscarded }) => ({
          ...JSON.parse(JSON.stringify(product)),
          quantitySold: deltaSold,
          quantityDiscarded: deltaDiscarded
        }));

        const newRecord: SalesRecord = {
          date: todayFormatted,
          products: productsCopy,
          totalProfit: todayTotalProfit
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
