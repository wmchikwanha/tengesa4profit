import { Product } from '@/lib/types';
import { GUEST_KEYS } from '@/contexts/GuestModeContext';

export interface GuestSalesRecord {
  date: string;
  products: Product[];
  totalProfit: number;
}

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable / full */
  }
};

export const guestStore = {
  getProducts: (): Product[] => read<Product[]>(GUEST_KEYS.products, []),
  setProducts: (products: Product[]) => write(GUEST_KEYS.products, products),
  getSales: (): GuestSalesRecord[] => read<GuestSalesRecord[]>(GUEST_KEYS.sales, []),
  setSales: (sales: GuestSalesRecord[]) => write(GUEST_KEYS.sales, sales),
  hasData: (): boolean =>
    read<Product[]>(GUEST_KEYS.products, []).length > 0 ||
    read<GuestSalesRecord[]>(GUEST_KEYS.sales, []).length > 0,
};

export const newGuestId = () =>
  `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
