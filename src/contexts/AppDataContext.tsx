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
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  // Helper function to get user-specific storage keys
  const getUserStorageKey = (key: string, userId: string | null) => {
    return userId ? `${key}_${userId}` : key;
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
  }, []);

  React.useEffect(() => {
    // Save user-specific products to localStorage
    if (currentUserId) {
      try {
        const userProductsKey = getUserStorageKey('products', currentUserId);
        localStorage.setItem(userProductsKey, JSON.stringify(products));
      } catch (error) {
        console.error('Failed to save products to localStorage:', error);
      }
    }
  }, [products, currentUserId]);

  React.useEffect(() => {
    // Save user-specific sales history to localStorage
    if (currentUserId) {
      try {
        const userHistoryKey = getUserStorageKey('salesHistory', currentUserId);
        localStorage.setItem(userHistoryKey, JSON.stringify(salesHistory));
      } catch (error) {
        console.error('Failed to save sales history to localStorage:', error);
      }
    }
  }, [salesHistory, currentUserId]);

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
    const todayTotalProfit = products.reduce((sum, product) => {
      const profit = product.quantitySold * 
        (product.sellingPrice - 
         (product.buyingPrice + 
          (product.transportCost / product.quantityBought) + 
          (product.stallFee / product.quantityBought)));
      return sum + profit;
    }, 0);

    // Create a deep copy of products to avoid reference issues
    const productsCopy = JSON.parse(JSON.stringify(products));
    
    const newRecord: SalesRecord = {
      date: todayFormatted,
      products: productsCopy,
      totalProfit: todayTotalProfit
    };
    
    setSalesHistory(prev => [...prev, newRecord]);
    
    // Use console.log instead of toast to avoid circular dependency
    console.log("History Saved: Today's sales have been added to history");
  };

  const clearAllData = () => {
    // Clear everything including products
    setProducts([]);
    setSalesHistory([]);
  };

  const clearSalesData = () => {
    // Add current state to history before clearing
    addToHistory();
    
    // Only clear sales data, preserve products but reset their sales quantities
    setProducts(prev => prev.map(product => ({
      ...product,
      quantitySold: 0,
      quantityDiscarded: 0
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
