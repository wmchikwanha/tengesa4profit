
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Currency } from '@/lib/types';

const CurrencySelector: React.FC = () => {
  const { t } = useLanguage();
  const { settings, setCurrency, setExchangeRate } = useCurrency();

  const handleCurrencyChange = (value: Currency) => {
    setCurrency(value);
    if (value === 'USD') {
      setExchangeRate(1);
    }
  };

  const handleExchangeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value) || 1;
    setExchangeRate(rate);
  };

  return (
    <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency" className="trader-label">{t.currency}</Label>
            <Select
              value={settings.currentCurrency}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="ZWL">ZWL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {settings.currentCurrency === 'ZWL' && (
            <div>
              <Label htmlFor="exchangeRate" className="trader-label">
                {t.exchangeRate}
              </Label>
              <Input
                id="exchangeRate"
                type="number"
                min="1"
                step="0.01"
                value={settings.exchangeRate}
                onChange={handleExchangeRateChange}
                className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
                placeholder={t.enterExchangeRate}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencySelector;
