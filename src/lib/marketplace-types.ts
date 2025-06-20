
export type UserRole = 'trader' | 'supplier' | 'both';

export type ProductCategory = 
  | 'food-beverages'
  | 'clothing-fashion'
  | 'electronics'
  | 'home-garden'
  | 'health-beauty'
  | 'sports-outdoors'
  | 'automotive'
  | 'books-media'
  | 'toys-games'
  | 'business-industrial'
  | 'personal-care'
  | 'services'
  | 'industrial-goods'
  | 'other';

export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
  'food-beverages': 'Food & Beverages',
  'clothing-fashion': 'Clothing & Fashion',
  'electronics': 'Electronics',
  'home-garden': 'Home & Garden',
  'health-beauty': 'Health & Beauty',
  'sports-outdoors': 'Sports & Outdoors',
  'automotive': 'Automotive',
  'books-media': 'Books & Media',
  'toys-games': 'Toys & Games',
  'business-industrial': 'Business & Industrial',
  'personal-care': 'Personal Care',
  'services': 'Services',
  'industrial-goods': 'Industrial Goods',
  'other': 'Other'
};

export interface SupplierProfile {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  unit: string; // e.g., "kg", "piece", "liter"
  minimumOrder?: number;
  brand?: string;
  supplierProfile?: SupplierProfile;
  isPubliclyVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInquiry {
  id: string;
  productId: string;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  quantity: number;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface InquiryResponse {
  id: string;
  inquiryId: string;
  supplierMessage: string;
  price?: number;
  availability: string;
  deliveryTerms?: string;
  createdAt: string;
}
