
import * as React from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Currency } from '@/lib/types';
import { Info } from 'lucide-react';

const CurrencySelector: React.FC = () => {
  const { t } = useLanguage();
  const { settings, setCurrency, setExchangeRate, rateUpdatedLabel } = useCurrency();

  const [draftRate, setDraftRate] = React.useState<string>(String(settings.exchangeRate));
  const [pendingRate, setPendingRate] = React.useState<number | null>(null);

  React.useEffect(() => {
    setDraftRate(String(settings.exchangeRate));
  }, [settings.exchangeRate]);

  const handleCurrencyChange = (value: Currency) => {
    setCurrency(value);
    if (value === 'USD') {
      setExchangeRate(1);
    }
  };

  const commitRate = () => {
    const rate = parseFloat(draftRate);
    if (!rate || rate <= 0 || rate === settings.exchangeRate) {
      setDraftRate(String(settings.exchangeRate));
      return;
    }

    const old = settings.exchangeRate || 1;
    const movedALot = old > 0 && Math.abs(rate - old) / old > 0.3;

    // Catch the missing / extra zero before it destroys the trader's numbers
    if (movedALot && old !== 1) {
      setPendingRate(rate);
      return;
    }

    setExchangeRate(rate);
  };

  return (
    <>
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
                  value={draftRate}
                  onChange={(e) => setDraftRate(e.target.value)}
                  onBlur={commitRate}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitRate(); }}
                  className="trader-input border-zimbabwe-green focus:border-zimbabwe-darkGreen"
                  placeholder={t.enterExchangeRate}
                />
                {rateUpdatedLabel && (
                  <p className="text-xs text-zimbabwe-darkGreen/80 mt-1">
                    {t.rateLastUpdated ?? 'Rate last changed'}: {rateUpdatedLabel}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 mt-4 text-sm text-zimbabwe-darkGreen">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              {t.enteringPricesIn ?? 'Prices you type now are in'}{' '}
              <strong>{settings.currentCurrency}</strong>
              {settings.currentCurrency === 'ZWL'
                ? ` (${t.savedAtRate ?? 'saved at rate'} ${settings.exchangeRate.toLocaleString('en-US')})`
                : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={pendingRate !== null} onOpenChange={(open) => { if (!open) setPendingRate(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.rateCheckTitle ?? 'Check this rate'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.rateCheckBody ?? 'You changed the rate from'}{' '}
              <strong>{settings.exchangeRate.toLocaleString('en-US')}</strong>{' '}
              {t.rateCheckTo ?? 'to'}{' '}
              <strong>{(pendingRate ?? 0).toLocaleString('en-US')}</strong>.{' '}
              {t.rateCheckQuestion ?? 'Is that right? A wrong rate makes all your prices wrong.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPendingRate(null); setDraftRate(String(settings.exchangeRate)); }}>
              {t.rateCheckFix ?? 'No, let me fix it'}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-zimbabwe-green hover:bg-green-700"
              onClick={() => { if (pendingRate) setExchangeRate(pendingRate); setPendingRate(null); }}
            >
              {t.rateCheckConfirm ?? 'Yes, that is correct'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CurrencySelector;
