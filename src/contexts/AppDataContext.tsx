import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  addToHistory: () => void;
}

const AppDataContext = createContext<AppDataContextType>({
  products: [],
  salesHistory: [],
  addProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},
  getProduct: () => undefined,
  clearAllData: () => {},
  addToHistory: () => {},
});

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with empty arrays, then load from localStorage in useEffect
  const [products, setProducts] = useState<Product[]>([]);
  const [salesHistory, setSalesHistory] = useState<SalesRecord[]>([]);

  useEffect(() => {
    // Load products from localStorage after component mounts
    try {
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    } catch (error) {
      console.error('Failed to load products from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // Load sales history from localStorage after component mounts
    try {
      const savedHistory = localStorage.getItem('salesHistory');
      if (savedHistory) {
        setSalesHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load sales history from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error('Failed to save products to localStorage:', error);
      // Don't use toast here since it's causing circular dependency
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    } catch (error) {
      console.error('Failed to save sales history to localStorage:', error);
      // Don't use toast here since it's causing circular dependency
    }
  }, [salesHistory]);

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
    
    // We'll use console.log instead of toast for now
    console.log("History Saved: Today's sales have been added to history");
  };

  const clearAllData = () => {
    // Add current state to history before clearing
    addToHistory();
    
    // Clear current products
    setProducts([]);
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
        addToHistory,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export default AppDataProvider;
