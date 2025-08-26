
export type UserRole = 'trader' | 'supplier' | 'both';

export type ProductCategory = 
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'dairy'
  | 'meat'
  | 'beverages'
  | 'snacks'
  | 'household'
  | 'clothing'
  | 'electronics'
  | 'tools'
  | 'books'
  | 'livestock'
  | 'produce'
  | 'condiments'
  | 'industrial'
  | 'other';

export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
  'vegetables': 'Vegetables',
  'fruits': 'Fruits',
  'grains': 'Grains',
  'dairy': 'Dairy',
  'meat': 'Meat',
  'beverages': 'Beverages',
  'snacks': 'Snacks',
  'household': 'Household',
  'clothing': 'Clothing',
  'electronics': 'Electronics',
  'tools': 'Tools',
  'books': 'Books',
  'livestock': 'Livestock',
  'produce': 'Produce',
  'condiments': 'Condiments & Additives',
  'industrial': 'Industrial',
  'other': 'Other'
};

export interface SupplierProfile {
  id: string;
  userId: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
  description?: string;
  website?: string;
  // Privacy settings
  showBusinessName: boolean;
  showContactPerson: boolean;
  showEmail: boolean;
  showPhoneNumber: boolean;
  showAddress: boolean;
  isActive: boolean;
  subscriptionStatus: string;
  trialEndDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceProduct {
  id: string;
  supplierId: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  unit: string; // e.g., "kg", "piece", "liter"
  minimumOrder?: number;
  brand?: string;
  supplierProfile?: SupplierProfile;
  isPubliclyVisible: boolean;
  dateOfListing: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInquiry {
  id: string;
  productId: string;
  productName: string;
  traderId: string;
  traderName: string;
  traderEmail: string;
  traderPhone: string;
  supplierId: string;
  message: string;
  quantity?: number;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface InquiryResponse {
  id: string;
  inquiryId: string;
  supplierId: string;
  supplierMessage: string;
  priceQuote?: number;
  availabilityNotes?: string;
  deliveryTerms?: string;
  createdAt: string;
}
