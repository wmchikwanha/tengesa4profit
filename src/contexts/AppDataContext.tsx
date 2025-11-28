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
  lastClearDate: string | null;
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
  lastClearDate: null,
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
  const [lastClearDate, setLastClearDate] = React.useState<string | null>(null);
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

    // Load user-specific lastClearDate from localStorage
    try {
      const userClearDateKey = getUserStorageKey('lastClearDate', uid);
      const savedClearDate = localStorage.getItem(userClearDateKey);
      if (savedClearDate) {
        setLastClearDate(savedClearDate);
      } else {
        setLastClearDate(null);
      }
    } catch (error) {
      console.error('Failed to load last clear date from localStorage:', error);
      setLastClearDate(null);
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

  // Persist lastClearDate
  React.useEffect(() => {
    try {
      const key = getUserStorageKey('lastClearDate', currentUserId);
      if (lastClearDate) {
        localStorage.setItem(key, lastClearDate);
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to save last clear date to localStorage:', error);
    }
  }, [lastClearDate, currentUserId]);

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

  const addToHistory = (date: string, productId: string, deltaSold: number, deltaDiscarded: number) => {
    if (!productId) return;

    // Use the provided date string (YYYY-MM-DD) as-is to avoid timezone shifts
    const recordDate = (date && /^\d{4}-\d{2}-\d{2}$/.test(date))
      ? date
      : new Date().toISOString().split('T')[0];

    const product = getProduct(productId);
    if (!product) return;

    setSalesHistory(prev => {
      const existingRecordIndex = prev.findIndex(record => record.date === recordDate);

      const calcProfitForProducts = (prods: Product[]) => {
        return prods.reduce((sum, historyProduct) => {
          const costPerUnit = historyProduct.buyingPrice + 
            (historyProduct.transportCost / historyProduct.quantityBought) + 
            (historyProduct.stallFee / historyProduct.quantityBought);
          const sellingPrice = historyProduct.sellingPrice || 
            (costPerUnit * (1 + historyProduct.markupPercentage / 100));
          const profitPerUnit = sellingPrice - costPerUnit;
          return sum + ((historyProduct.quantitySold || 0) * profitPerUnit);
        }, 0);
      };

      if (existingRecordIndex >= 0) {
        // Update existing record for the date by adding deltas ONLY to that date
        const existingRecord = prev[existingRecordIndex];
        const updatedProducts = [...existingRecord.products];

        const idx = updatedProducts.findIndex(p => p.id === productId);
        if (idx >= 0) {
          const existing = updatedProducts[idx];
          updatedProducts[idx] = {
            ...existing,
            quantitySold: (existing.quantitySold || 0) + (deltaSold || 0),
            quantityDiscarded: (existing.quantityDiscarded || 0) + (deltaDiscarded || 0)
          };
        } else {
          updatedProducts.push({
            ...JSON.parse(JSON.stringify(product)),
            quantitySold: deltaSold || 0,
            quantityDiscarded: deltaDiscarded || 0
          });
        }

        const recalculatedProfit = calcProfitForProducts(updatedProducts);

        const updatedRecord = {
          ...existingRecord,
          products: updatedProducts,
          totalProfit: recalculatedProfit
        };

        const newHistory = [...prev];
        newHistory[existingRecordIndex] = updatedRecord;
        return newHistory;
      } else {
        // Create new record for the date with the delta quantities
        const productsCopy: Product[] = [{
          ...JSON.parse(JSON.stringify(product)),
          quantitySold: deltaSold || 0,
          quantityDiscarded: deltaDiscarded || 0
        }];

        const totalProfitForDay = calcProfitForProducts(productsCopy);

        const newRecord: SalesRecord = {
          date: recordDate,
          products: productsCopy,
          totalProfit: totalProfitForDay
        };
        return [...prev, newRecord];
      }
    });
  };

  const clearAllData = () => {
    // Clear everything including products and baselines
    setProducts([]);
    setSalesHistory([]);
    setSalesBaseline({});
    // Set lastClearDate to current date in dd/MM/yyyy format
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    setLastClearDate(formattedDate);
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
    // Set lastClearDate to current date in dd/MM/yyyy format
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    setLastClearDate(formattedDate);
  };

  return (
    <AppDataContext.Provider
      value={{
        products,
        salesHistory,
        lastClearDate,
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
