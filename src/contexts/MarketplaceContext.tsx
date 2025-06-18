
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, SupplierProfile, MarketplaceProduct } from '@/lib/marketplace-types';

interface MarketplaceContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  supplierProfile: SupplierProfile | null;
  setSupplierProfile: (profile: SupplierProfile | null) => void;
  marketplaceProducts: MarketplaceProduct[];
  setMarketplaceProducts: (products: MarketplaceProduct[]) => void;
  addMarketplaceProduct: (product: MarketplaceProduct) => void;
  updateMarketplaceProduct: (id: string, updates: Partial<MarketplaceProduct>) => void;
  deleteMarketplaceProduct: (id: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('trader');
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedRole && ['trader', 'supplier', 'both'].includes(savedRole)) {
      setUserRole(savedRole);
    }

    const savedProfile = localStorage.getItem('supplierProfile');
    if (savedProfile) {
      try {
        setSupplierProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading supplier profile:', error);
      }
    }

    const savedProducts = localStorage.getItem('marketplaceProducts');
    if (savedProducts) {
      try {
        setMarketplaceProducts(JSON.parse(savedProducts));
      } catch (error) {
        console.error('Error loading marketplace products:', error);
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

  useEffect(() => {
    if (supplierProfile) {
      localStorage.setItem('supplierProfile', JSON.stringify(supplierProfile));
    } else {
      localStorage.removeItem('supplierProfile');
    }
  }, [supplierProfile]);

  useEffect(() => {
    localStorage.setItem('marketplaceProducts', JSON.stringify(marketplaceProducts));
  }, [marketplaceProducts]);

  const addMarketplaceProduct = (product: MarketplaceProduct) => {
    setMarketplaceProducts(prev => [...prev, product]);
  };

  const updateMarketplaceProduct = (id: string, updates: Partial<MarketplaceProduct>) => {
    setMarketplaceProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...updates, updatedAt: new Date().toISOString() } : product
      )
    );
  };

  const deleteMarketplaceProduct = (id: string) => {
    setMarketplaceProducts(prev => prev.filter(product => product.id !== id));
  };

  const value = {
    userRole,
    setUserRole,
    supplierProfile,
    setSupplierProfile,
    marketplaceProducts,
    setMarketplaceProducts,
    addMarketplaceProduct,
    updateMarketplaceProduct,
    deleteMarketplaceProduct,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};
