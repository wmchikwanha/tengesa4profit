
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormField, FormLabel, FormControl } from "@/components/ui/form";
import { format, parseISO } from 'date-fns';
import { calculateProduct, Product } from '@/lib/types';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SalesHistoryRecord {
  date: string;
  totalProfit: number;
  products: Product[];
}

interface DateFilterForm {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

interface HistorySectionProps {
  viewingHistory: boolean;
  salesHistory: SalesHistoryRecord[];
  isDateFilterOpen?: boolean;
  setIsDateFilterOpen?: (isOpen: boolean) => void;
  onApplyDateFilter?: (data: DateFilterForm) => void;
  onResetDateFilter?: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ 
  viewingHistory, 
  salesHistory,
  isDateFilterOpen = false,
  setIsDateFilterOpen = () => {},
  onApplyDateFilter = () => {},
  onResetDateFilter = () => {}
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();

  const form = useForm<DateFilterForm>({
    defaultValues: {
      startDate: undefined,
      endDate: undefined
    }
  });

  const handleApplyFilter = () => {
    onApplyDateFilter({ startDate, endDate });
    setIsDateFilterOpen(false);
  };

  const resetDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    form.reset();
    onResetDateFilter();
  };

  if (!viewingHistory) return null;

  return (
    <Card className="bg-white border border-zimbabwe-green">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <CardTitle className="text-lg font-bold text-zimbabwe-darkGreen">{t.history}</CardTitle>
          <div className="flex space-x-2">
            <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-auto border-zimbabwe-green justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate && endDate ? (
                    <span>
                      {format(startDate, 'PPP')} - {format(endDate, 'PPP')}
                    </span>
                  ) : (
                    <span>{t.selectDateRange}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-lg z-50" align="start">
                <div className="grid gap-4 p-4 bg-white">
                  <div className="grid gap-2">
                    <FormLabel className="text-sm font-medium">{t.startDate}</FormLabel>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => endDate ? date > endDate : false}
                      initialFocus
                      className="p-3 pointer-events-auto bg-white rounded-md border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <FormLabel className="text-sm font-medium">{t.endDate}</FormLabel>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                      className="p-3 pointer-events-auto bg-white rounded-md border"
                    />
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button type="button" variant="outline" onClick={resetDateFilter}>
                      {t.reset}
                    </Button>
                    <Button type="button" onClick={handleApplyFilter}>
                      {t.apply}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {salesHistory.length === 0 ? (
          <p className="text-gray-500">{t.noHistory}</p>
        ) : (
          salesHistory.map((record, index) => (
            <div key={index} className="border border-zimbabwe-green rounded-lg p-4 bg-zimbabwe-lightGreen">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">
                  {format(parseISO(record.date), 'PPP')}
                </h3>
                <span className="font-bold text-zimbabwe-darkGreen">
                  {formatPrice(record.totalProfit)}
                </span>
              </div>
              
              <div className="space-y-2">
                {record.products.map(product => {
                  const calc = calculateProduct(product);
                  return (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span>{product.name}</span>
                      <span>
                        {t.sold}: {product.quantitySold} | {formatPrice(calc.dailyProfit)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
