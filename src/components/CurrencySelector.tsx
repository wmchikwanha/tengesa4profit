
import React, { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Currency } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DollarSign, TrendingUp } from 'lucide-react';

const CurrencySelector: React.FC = () => {
  const { settings, setCurrency, setExchangeRate } = useCurrency();
  const [isExchangeRateDialogOpen, setIsExchangeRateDialogOpen] = useState(false);
  const [tempExchangeRate, setTempExchangeRate] = useState(settings.exchangeRate.toString());

  const handleCurrencyChange = (currency: Currency) => {
    if (currency === 'ZWL' && settings.currentCurrency === 'USD') {
      setIsExchangeRateDialogOpen(true);
    } else {
      setCurrency(currency);
    }
  };

  const handleExchangeRateSubmit = () => {
    const rate = Number(tempExchangeRate);
    if (rate > 0) {
      setExchangeRate(rate);
      setCurrency('ZWL');
      setIsExchangeRateDialogOpen(false);
    }
  };

  const handleUpdateExchangeRate = () => {
    setTempExchangeRate(settings.exchangeRate.toString());
    setIsExchangeRateDialogOpen(true);
  };

  return (
    <>
      <Card className="bg-white border border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Currency:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={settings.currentCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="ZWL">ZWL</SelectItem>
                </SelectContent>
              </Select>
              
              {settings.currentCurrency === 'ZWL' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpdateExchangeRate}
                  className="flex items-center gap-1"
                >
                  <TrendingUp className="h-4 w-4" />
                  Rate: {settings.exchangeRate}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isExchangeRateDialogOpen} onOpenChange={setIsExchangeRateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Exchange Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="exchangeRate" className="text-sm font-medium">
                ZWL per 1 USD
              </label>
              <Input
                id="exchangeRate"
                value={tempExchangeRate}
                onChange={(e) => setTempExchangeRate(e.target.value)}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 4500.00"
                className="border-blue-200 focus:border-blue-400"
              />
              <p className="text-xs text-gray-600">
                Enter how many ZWL equals 1 USD
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsExchangeRateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleExchangeRateSubmit}
            >
              Set Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CurrencySelector;
