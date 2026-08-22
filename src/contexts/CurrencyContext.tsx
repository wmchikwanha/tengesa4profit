import * as React from 'react';
import { Currency, CurrencySettings, toBaseUsd, fromBaseUsd } from '@/lib/types';

const STALE_AFTER_DAYS = 3;

interface CurrencyContextType {
  settings: CurrencySettings;
  setCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;
  /** Format a USD-base amount in the currency the trader is currently viewing. */
  formatPrice: (price: number) => string;
  /** Format an amount that is ALREADY in the current currency (typed by the trader). */
  formatEntry: (amount: number) => string;
  /** Format a USD-base amount as US dollars, whatever the view currency is. */
  formatUsd: (price: number) => string;
  getCurrencySymbol: () => string;
  convertPrice: (usdPrice: number) => number;
  /** Convert a freshly typed amount into the USD base. */
  toBase: (amount: number) => number;
  rateIsStale: boolean;
  rateAgeDays: number | null;
  rateUpdatedLabel: string | null;
}

const defaultSettings: CurrencySettings = { currentCurrency: 'USD', exchangeRate: 1 };

const CurrencyContext = React.createContext<CurrencyContextType>({
  settings: defaultSettings,
  setCurrency: () => {},
  setExchangeRate: () => {},
  formatPrice: () => '',
  formatEntry: () => '',
  formatUsd: () => '',
  getCurrencySymbol: () => '$',
  convertPrice: () => 0,
  toBase: (a: number) => a,
  rateIsStale: false,
  rateAgeDays: null,
  rateUpdatedLabel: null,
});

export const useCurrency = () => React.useContext(CurrencyContext);

const formatAmount = (amount: number, currency: Currency) => {
  if (currency === 'ZWL') {
    // Street reality: nobody prices in ZWL cents.
    return `ZWL ${Math.round(amount).toLocaleString('en-US')}`;
  }
  return `$${amount.toFixed(2)}`;
};

const dayLabel = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = React.useState<CurrencySettings>(defaultSettings);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('currencySettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load currency settings:', error);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem('currencySettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save currency settings:', error);
    }
  }, [settings]);

  const setCurrency = (currency: Currency) => {
    setSettings(prev => ({ ...prev, currentCurrency: currency }));
  };

  const setExchangeRate = (rate: number) => {
    setSettings(prev => ({
      ...prev,
      previousRate: prev.exchangeRate,
      exchangeRate: rate,
      rateUpdatedAt: new Date().toISOString(),
    }));
  };

  const getCurrencySymbol = () => (settings.currentCurrency === 'USD' ? '$' : 'ZWL');

  const convertPrice = (usdPrice: number) =>
    fromBaseUsd(usdPrice, settings.currentCurrency, settings.exchangeRate);

  const toBase = (amount: number) =>
    toBaseUsd(amount, settings.currentCurrency, settings.exchangeRate);

  const formatPrice = (price: number) =>
    formatAmount(convertPrice(price || 0), settings.currentCurrency);

  const formatEntry = (amount: number) =>
    formatAmount(amount || 0, settings.currentCurrency);

  const formatUsd = (price: number) => `$${(price || 0).toFixed(2)}`;

  const rateAgeDays = React.useMemo(() => {
    if (!settings.rateUpdatedAt) return null;
    const then = new Date(settings.rateUpdatedAt).getTime();
    if (isNaN(then)) return null;
    return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
  }, [settings.rateUpdatedAt]);

  const rateIsStale =
    settings.currentCurrency === 'ZWL' &&
    (rateAgeDays === null || rateAgeDays >= STALE_AFTER_DAYS);

  return (
    <CurrencyContext.Provider
      value={{
        settings,
        setCurrency,
        setExchangeRate,
        formatPrice,
        formatEntry,
        formatUsd,
        getCurrencySymbol,
        convertPrice,
        toBase,
        rateIsStale,
        rateAgeDays,
        rateUpdatedLabel: dayLabel(settings.rateUpdatedAt),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
