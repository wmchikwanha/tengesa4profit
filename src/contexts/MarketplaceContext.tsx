
import * as React from 'react';
import { UserRole, SupplierProfile, MarketplaceProduct, ProductInquiry, InquiryResponse } from '@/lib/marketplace-types';
import { useAuth } from '@/contexts/AuthContext';

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

const MarketplaceContext = React.createContext<MarketplaceContextType | undefined>(undefined);

export const useMarketplace = () => {
  const context = React.useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = React.useState<UserRole>('trader');
  const [supplierProfile, setSupplierProfile] = React.useState<SupplierProfile | null>(null);
  const [marketplaceProducts, setMarketplaceProducts] = React.useState<MarketplaceProduct[]>([]);
  const [inquiries, setInquiries] = React.useState<ProductInquiry[]>([]);
  const [inquiryResponses, setInquiryResponses] = React.useState<InquiryResponse[]>([]);

  // Get current user ID for user-specific data
  const currentUserId = user?.id ?? null;

  // Helper function to get user-specific storage keys
  const getUserStorageKey = (key: string, userId: string | null) => {
    const uid = userId ?? 'guest';
    return `marketplace:${uid}:${key}`;
  };

  // Load data from localStorage on mount
  React.useEffect(() => {
    const savedRole = localStorage.getItem(getUserStorageKey('userRole', currentUserId)) as UserRole;
    if (savedRole && ['trader', 'supplier', 'both'].includes(savedRole)) {
      setUserRole(savedRole);
    }

    const savedProfile = localStorage.getItem(getUserStorageKey('supplierProfile', currentUserId));
    if (savedProfile) {
      try {
        setSupplierProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading supplier profile:', error);
      }
    }

    const savedProducts = localStorage.getItem(getUserStorageKey('marketplaceProducts', currentUserId));
    if (savedProducts) {
      try {
        setMarketplaceProducts(JSON.parse(savedProducts));
      } catch (error) {
        console.error('Error loading marketplace products:', error);
      }
    }

    const savedInquiries = localStorage.getItem(getUserStorageKey('productInquiries', currentUserId));
    if (savedInquiries) {
      try {
        setInquiries(JSON.parse(savedInquiries));
      } catch (error) {
        console.error('Error loading inquiries:', error);
      }
    }

    const savedResponses = localStorage.getItem(getUserStorageKey('inquiryResponses', currentUserId));
    if (savedResponses) {
      try {
        setInquiryResponses(JSON.parse(savedResponses));
      } catch (error) {
        console.error('Error loading inquiry responses:', error);
      }
    }
  }, [currentUserId]);

  // Save to localStorage when data changes
  React.useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(getUserStorageKey('userRole', currentUserId), userRole);
    }
  }, [userRole, currentUserId]);

  React.useEffect(() => {
    if (currentUserId) {
      if (supplierProfile) {
        localStorage.setItem(getUserStorageKey('supplierProfile', currentUserId), JSON.stringify(supplierProfile));
      } else {
        localStorage.removeItem(getUserStorageKey('supplierProfile', currentUserId));
      }
    }
  }, [supplierProfile, currentUserId]);

  React.useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(getUserStorageKey('marketplaceProducts', currentUserId), JSON.stringify(marketplaceProducts));
    }
  }, [marketplaceProducts, currentUserId]);

  React.useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(getUserStorageKey('productInquiries', currentUserId), JSON.stringify(inquiries));
    }
  }, [inquiries, currentUserId]);

  React.useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(getUserStorageKey('inquiryResponses', currentUserId), JSON.stringify(inquiryResponses));
    }
  }, [inquiryResponses, currentUserId]);

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
