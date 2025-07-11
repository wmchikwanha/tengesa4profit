
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, SupplierProfile, MarketplaceProduct, ProductInquiry, InquiryResponse } from '@/lib/marketplace-types';

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
  inquiries: ProductInquiry[];
  addInquiry: (inquiry: ProductInquiry) => void;
  updateInquiryStatus: (id: string, status: ProductInquiry['status']) => void;
  inquiryResponses: InquiryResponse[];
  addInquiryResponse: (response: InquiryResponse) => void;
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
  const [inquiries, setInquiries] = useState<ProductInquiry[]>([]);
  const [inquiryResponses, setInquiryResponses] = useState<InquiryResponse[]>([]);

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

    const savedInquiries = localStorage.getItem('productInquiries');
    if (savedInquiries) {
      try {
        setInquiries(JSON.parse(savedInquiries));
      } catch (error) {
        console.error('Error loading inquiries:', error);
      }
    }

    const savedResponses = localStorage.getItem('inquiryResponses');
    if (savedResponses) {
      try {
        setInquiryResponses(JSON.parse(savedResponses));
      } catch (error) {
        console.error('Error loading inquiry responses:', error);
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

  useEffect(() => {
    localStorage.setItem('productInquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('inquiryResponses', JSON.stringify(inquiryResponses));
  }, [inquiryResponses]);

  const addMarketplaceProduct = (product: MarketplaceProduct) => {
    setMarketplaceProducts(prev => [...prev, product]);
  };

  const updateMarketplaceProduct = (id: string, updates: Partial<MarketplaceProduct>) => {
    setMarketplaceProducts(prev => 
      prev.map(product => 
        product.id === id ? { 
          ...product, 
          ...updates, 
          updatedAt: new Date().toISOString(),
          // Ensure supplier profile is updated if it exists
          supplierProfile: supplierProfile || product.supplierProfile
        } : product
      )
    );
  };

  const deleteMarketplaceProduct = (id: string) => {
    setMarketplaceProducts(prev => prev.filter(product => product.id !== id));
  };

  const addInquiry = (inquiry: ProductInquiry) => {
    setInquiries(prev => [...prev, inquiry]);
  };

  const updateInquiryStatus = (id: string, status: ProductInquiry['status']) => {
    setInquiries(prev => 
      prev.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status, updatedAt: new Date().toISOString() } : inquiry
      )
    );
  };

  const addInquiryResponse = (response: InquiryResponse) => {
    setInquiryResponses(prev => [...prev, response]);
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
    inquiries,
    addInquiry,
    updateInquiryStatus,
    inquiryResponses,
    addInquiryResponse,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};
