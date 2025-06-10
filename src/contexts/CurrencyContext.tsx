
import * as React from 'react';
import { Currency, CurrencySettings } from '@/lib/types';

interface CurrencyContextType {
  settings: CurrencySettings;
  setCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;
  formatPrice: (price: number) => string;
  getCurrencySymbol: () => string;
  convertPrice: (usdPrice: number) => number;
}

const CurrencyContext = React.createContext<CurrencyContextType>({
  settings: { currentCurrency: 'USD', exchangeRate: 1 },
  setCurrency: () => {},
  setExchangeRate: () => {},
  formatPrice: () => '',
  getCurrencySymbol: () => '$',
  convertPrice: () => 0,
});

export const useCurrency = () => React.useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with default values first, then update from localStorage in useEffect
  const [settings, setSettings] = React.useState<CurrencySettings>({ currentCurrency: 'USD', exchangeRate: 1 });

  React.useEffect(() => {
    // Load currency settings from localStorage after component mounts
    try {
      const saved = localStorage.getItem('currencySettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
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
    setSettings(prev => ({ ...prev, exchangeRate: rate }));
  };

  const getCurrencySymbol = () => {
    return settings.currentCurrency === 'USD' ? '$' : 'ZWL';
  };

  const convertPrice = (usdPrice: number) => {
    return settings.currentCurrency === 'USD' ? usdPrice : usdPrice * settings.exchangeRate;
  };

  const formatPrice = (price: number) => {
    const convertedPrice = convertPrice(price);
    const symbol = getCurrencySymbol();
    return `${symbol}${convertedPrice.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        settings,
        setCurrency,
        setExchangeRate,
        formatPrice,
        getCurrencySymbol,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
