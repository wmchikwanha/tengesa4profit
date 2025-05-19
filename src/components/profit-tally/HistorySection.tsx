
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormField, FormLabel } from "@/components/ui/form";
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

  const form = useForm<DateFilterForm>({
    defaultValues: {
      startDate: undefined,
      endDate: undefined
    }
  });

  const resetDateFilter = () => {
    form.reset();
    onResetDateFilter();
  };

  if (!viewingHistory) return null;

  return (
    <Card className="bg-white border border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <CardTitle className="text-lg font-bold text-blue-800">{t.history}</CardTitle>
          <div className="flex space-x-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onApplyDateFilter)} className="flex space-x-2">
                <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-auto border-blue-300 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('startDate') && form.watch('endDate') ? (
                        <span>
                          {format(form.watch('startDate')!, 'PPP')} - {format(form.watch('endDate')!, 'PPP')}
                        </span>
                      ) : (
                        <span>{t.selectDateRange}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="grid gap-2 p-4">
                      <div className="grid gap-2">
                        <FormLabel>{t.startDate}</FormLabel>
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => field.value && form.watch('endDate') ? date > form.watch('endDate')! : false}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FormLabel>{t.endDate}</FormLabel>
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => field.value && form.watch('startDate') ? date < form.watch('startDate')! : false}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          )}
                        />
                      </div>
                      <div className="flex justify-between pt-2">
                        <Button type="button" variant="outline" onClick={resetDateFilter}>
                          {t.reset}
                        </Button>
                        <Button type="submit">
                          {t.apply}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </form>
            </Form>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {salesHistory.length === 0 ? (
          <p className="text-gray-500">{t.noHistory}</p>
        ) : (
          salesHistory.map((record, index) => (
            <div key={index} className="border border-blue-100 rounded-lg p-4 bg-blue-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">
                  {format(parseISO(record.date), 'PPP')}
                </h3>
                <span className="font-bold text-blue-700">
                  {t.currency}{record.totalProfit.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-2">
                {record.products.map(product => {
                  const calc = calculateProduct(product);
                  return (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span>{product.name}</span>
                      <span>
                        {t.sold}: {product.quantitySold} | {t.currency}{calc.dailyProfit.toFixed(2)}
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
