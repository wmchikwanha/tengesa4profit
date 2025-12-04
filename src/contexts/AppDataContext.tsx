import * as React from 'react';
import { Product } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';

export interface SalesRecord {
  date: string;
  products: Product[];
  totalProfit: number;
}

interface AppDataContextType {
  products: Product[];
  salesHistory: SalesRecord[];
  lastClearDate: string | null;
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  clearAllData: () => Promise<void>;
  clearSalesData: () => Promise<void>;
  addToHistory: (date: string, productId: string, deltaSold: number, deltaDiscarded: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppDataContext = React.createContext<AppDataContextType>({
  products: [],
  salesHistory: [],
  lastClearDate: null,
  loading: true,
  addProduct: async () => {},
  updateProduct: async () => {},
  deleteProduct: async () => {},
  getProduct: () => undefined,
  clearAllData: async () => {},
  clearSalesData: async () => {},
  addToHistory: async () => {},
  refreshData: async () => {},
});

export const useAppData = () => React.useContext(AppDataContext);

// Helper to convert Supabase row to Product type
const mapDbToProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  supplier: row.supplier || '',
  purchaseDate: row.purchase_date || undefined,
  quantityBought: row.quantity_bought || 0,
  unitOfMeasurement: row.unit_of_measurement || 'piece',
  buyingPrice: Number(row.buying_price) || 0,
  transportCost: Number(row.transport_cost) || 0,
  stallFee: Number(row.stall_fee) || 0,
  markupPercentage: Number(row.markup_percentage) || 0,
  sellingPrice: Number(row.selling_price) || 0,
  quantitySold: row.quantity_sold || 0,
  quantityDiscarded: row.quantity_discarded || 0,
  description: row.description || undefined,
});

// Helper to convert Product to Supabase insert/update format
const mapProductToDb = (product: Partial<Product>, businessId: string) => ({
  business_id: businessId,
  name: product.name,
  supplier: product.supplier || null,
  purchase_date: product.purchaseDate || null,
  quantity_bought: product.quantityBought || 0,
  unit_of_measurement: product.unitOfMeasurement || 'piece',
  buying_price: product.buyingPrice || 0,
  transport_cost: product.transportCost || 0,
  stall_fee: product.stallFee || 0,
  markup_percentage: product.markupPercentage || 0,
  selling_price: product.sellingPrice || null,
  quantity_sold: product.quantitySold || 0,
  quantity_discarded: product.quantityDiscarded || 0,
  description: product.description || null,
});

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [salesHistory, setSalesHistory] = React.useState<SalesRecord[]>([]);
  const [lastClearDate, setLastClearDate] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  const { user } = useAuth();
  const { businessId, hasBusiness } = useBusiness();

  // Load products from Supabase
  const loadProducts = React.useCallback(async () => {
    if (!businessId) {
      setProducts([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        return;
      }

      setProducts((data || []).map(mapDbToProduct));
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }, [businessId]);

  // Load sales history from Supabase
  const loadSalesHistory = React.useCallback(async () => {
    if (!businessId) {
      setSalesHistory([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('sales_history')
        .select('*')
        .eq('business_id', businessId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading sales history:', error);
        return;
      }

      const records: SalesRecord[] = (data || []).map(row => ({
        date: row.date,
        products: Array.isArray(row.products) ? (row.products as unknown as Product[]) : [],
        totalProfit: Number(row.total_profit) || 0,
      }));

      setSalesHistory(records);
    } catch (error) {
      console.error('Failed to load sales history:', error);
    }
  }, [businessId]);

  // Load lastClearDate from localStorage (business-specific)
  const loadLastClearDate = React.useCallback(() => {
    if (!businessId) {
      setLastClearDate(null);
      return;
    }
    try {
      const key = `t4p:${businessId}:lastClearDate`;
      const saved = localStorage.getItem(key);
      setLastClearDate(saved || null);
    } catch (error) {
      console.error('Failed to load lastClearDate:', error);
    }
  }, [businessId]);

  // Main data loading effect
  React.useEffect(() => {
    const loadData = async () => {
      if (!hasBusiness || !businessId) {
        setProducts([]);
        setSalesHistory([]);
        setLastClearDate(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      await Promise.all([loadProducts(), loadSalesHistory()]);
      loadLastClearDate();
      setLoading(false);
    };

    loadData();
  }, [businessId, hasBusiness, loadProducts, loadSalesHistory, loadLastClearDate]);

  // Refresh data function
  const refreshData = React.useCallback(async () => {
    if (!businessId) return;
    await Promise.all([loadProducts(), loadSalesHistory()]);
    loadLastClearDate();
  }, [businessId, loadProducts, loadSalesHistory, loadLastClearDate]);

  // Add product to Supabase
  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!businessId) {
      console.error('No business ID - cannot add product');
      return;
    }

    const dbProduct = mapProductToDb(product, businessId);
    
    const { data, error } = await supabase
      .from('products')
      .insert(dbProduct)
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      throw new Error(error.message);
    }

    if (data) {
      setProducts(prev => [mapDbToProduct(data), ...prev]);
    }
  };

  // Update product in Supabase
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!businessId) return;

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
    if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
    if (updates.quantityBought !== undefined) dbUpdates.quantity_bought = updates.quantityBought;
    if (updates.unitOfMeasurement !== undefined) dbUpdates.unit_of_measurement = updates.unitOfMeasurement;
    if (updates.buyingPrice !== undefined) dbUpdates.buying_price = updates.buyingPrice;
    if (updates.transportCost !== undefined) dbUpdates.transport_cost = updates.transportCost;
    if (updates.stallFee !== undefined) dbUpdates.stall_fee = updates.stallFee;
    if (updates.markupPercentage !== undefined) dbUpdates.markup_percentage = updates.markupPercentage;
    if (updates.sellingPrice !== undefined) dbUpdates.selling_price = updates.sellingPrice;
    if (updates.quantitySold !== undefined) dbUpdates.quantity_sold = updates.quantitySold;
    if (updates.quantityDiscarded !== undefined) dbUpdates.quantity_discarded = updates.quantityDiscarded;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error updating product:', error);
      throw new Error(error.message);
    }

    setProducts(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  // Delete product from Supabase
  const deleteProduct = async (id: string) => {
    if (!businessId) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error(error.message);
    }

    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  // Add to sales history in Supabase
  const addToHistory = async (date: string, productId: string, deltaSold: number, deltaDiscarded: number) => {
    if (!productId || !businessId || !user?.id) return;

    const recordDate = (date && /^\d{4}-\d{2}-\d{2}$/.test(date))
      ? date
      : new Date().toISOString().split('T')[0];

    const product = getProduct(productId);
    if (!product) return;

    // Calculate profit for this sale
    const costPerUnit = product.buyingPrice + 
      (product.transportCost / product.quantityBought) + 
      (product.stallFee / product.quantityBought);
    const sellingPrice = product.sellingPrice || 
      (costPerUnit * (1 + product.markupPercentage / 100));
    const profitPerUnit = sellingPrice - costPerUnit;
    const profitDelta = deltaSold * profitPerUnit;

    // Check if record exists for this date
    const { data: existingRecords } = await supabase
      .from('sales_history')
      .select('*')
      .eq('business_id', businessId)
      .eq('date', recordDate);

    const existingRecord = existingRecords?.[0];

    if (existingRecord) {
      // Update existing record
      const existingProducts = Array.isArray(existingRecord.products) 
        ? (existingRecord.products as unknown as Product[])
        : [];
      
      const idx = existingProducts.findIndex((p: Product) => p.id === productId);
      let updatedProducts: Product[];
      
      if (idx >= 0) {
        updatedProducts = [...existingProducts];
        updatedProducts[idx] = {
          ...updatedProducts[idx],
          quantitySold: (updatedProducts[idx].quantitySold || 0) + deltaSold,
          quantityDiscarded: (updatedProducts[idx].quantityDiscarded || 0) + deltaDiscarded,
        };
      } else {
        updatedProducts = [...existingProducts, {
          ...product,
          quantitySold: deltaSold,
          quantityDiscarded: deltaDiscarded,
        }];
      }

      const newTotalProfit = Number(existingRecord.total_profit) + profitDelta;

      const { error } = await supabase
        .from('sales_history')
        .update({
          products: JSON.parse(JSON.stringify(updatedProducts)),
          total_profit: newTotalProfit,
        })
        .eq('id', existingRecord.id);

      if (error) {
        console.error('Error updating sales history:', error);
        return;
      }
    } else {
      // Create new record
      const newProducts: Product[] = [{
        ...product,
        quantitySold: deltaSold,
        quantityDiscarded: deltaDiscarded,
      }];

      const { error } = await supabase
        .from('sales_history')
        .insert([{
          business_id: businessId,
          date: recordDate,
          recorded_by: user.id,
          products: JSON.parse(JSON.stringify(newProducts)),
          total_profit: profitDelta,
        }]);

      if (error) {
        console.error('Error creating sales history:', error);
        return;
      }
    }

    // Refresh sales history
    await loadSalesHistory();
  };

  // Clear all data
  const clearAllData = async () => {
    if (!businessId) return;

    // Delete all products
    await supabase
      .from('products')
      .delete()
      .eq('business_id', businessId);

    // Delete all sales history
    await supabase
      .from('sales_history')
      .delete()
      .eq('business_id', businessId);

    setProducts([]);
    setSalesHistory([]);

    // Set lastClearDate
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    setLastClearDate(formattedDate);
    
    try {
      const key = `t4p:${businessId}:lastClearDate`;
      localStorage.setItem(key, formattedDate);
    } catch (error) {
      console.error('Failed to save lastClearDate:', error);
    }
  };

  // Clear sales data (reset quantities on products)
  const clearSalesData = async () => {
    if (!businessId) return;

    // Reset quantitySold and quantityDiscarded for all products
    const { error } = await supabase
      .from('products')
      .update({
        quantity_sold: 0,
        quantity_discarded: 0,
      })
      .eq('business_id', businessId);

    if (error) {
      console.error('Error clearing sales data:', error);
      return;
    }

    setProducts(prev => prev.map(product => ({
      ...product,
      quantitySold: 0,
      quantityDiscarded: 0,
    })));

    // Set lastClearDate
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    setLastClearDate(formattedDate);
    
    try {
      const key = `t4p:${businessId}:lastClearDate`;
      localStorage.setItem(key, formattedDate);
    } catch (error) {
      console.error('Failed to save lastClearDate:', error);
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        products,
        salesHistory,
        lastClearDate,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        clearAllData,
        clearSalesData,
        addToHistory,
        refreshData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export default AppDataProvider;
