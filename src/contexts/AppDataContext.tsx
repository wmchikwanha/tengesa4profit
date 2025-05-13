
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

interface AppDataContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  clearAllData: () => void;
}

const AppDataContext = createContext<AppDataContextType>({
  products: [],
  addProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},
  getProduct: () => undefined,
  clearAllData: () => {},
});

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const savedProducts = localStorage.getItem('products');
      return savedProducts ? JSON.parse(savedProducts) : [];
    } catch (error) {
      console.error('Failed to load products from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error('Failed to save products to localStorage:', error);
      toast({
        title: "Error",
        description: "Failed to save your data",
        variant: "destructive",
      });
    }
  }, [products, toast]);

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

  const clearAllData = () => {
    setProducts([]);
  };

  return (
    <AppDataContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        clearAllData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};
