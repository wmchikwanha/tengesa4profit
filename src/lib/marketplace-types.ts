
export type UserRole = 'trader' | 'supplier' | 'both';

export interface SupplierProfile {
  id: string;
  userId: string;
  businessName: string;
  contactPerson: string;
  address: string;
  phoneNumber: string;
  email: string;
  description?: string;
  showBusinessName: boolean;
  showContactPerson: boolean;
  showAddress: boolean;
  showPhoneNumber: boolean;
  showEmail: boolean;
  isActive: boolean;
  trialEndDate?: string;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceProduct {
  id: string;
  supplierId: string;
  supplierProfile?: SupplierProfile;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: ProductCategory;
  brand?: string;
  isPubliclyVisible: boolean;
  dateOfListing: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory = 
  | 'fresh-produce'
  | 'grains-cereals'
  | 'dairy-products'
  | 'meat-poultry'
  | 'processed-foods'
  | 'beverages'
  | 'household-goods'
  | 'agricultural-supplies'
  | 'other';

export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
  'fresh-produce': 'Fresh Produce',
  'grains-cereals': 'Grains & Cereals',
  'dairy-products': 'Dairy Products',
  'meat-poultry': 'Meat & Poultry',
  'processed-foods': 'Processed Foods',
  'beverages': 'Beverages',
  'household-goods': 'Household Goods',
  'agricultural-supplies': 'Agricultural Supplies',
  'other': 'Other'
};
