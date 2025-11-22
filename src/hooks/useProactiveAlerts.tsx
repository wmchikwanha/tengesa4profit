import { useEffect, useCallback } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { calculateProduct } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const useProactiveAlerts = () => {
  const { products, salesHistory } = useAppData();
  const { settings, getCurrencySymbol } = useCurrency();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const buildBusinessContext = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = salesHistory.filter(s => s.date === today);
    const todayProfit = todaySales.reduce((sum, s) => sum + s.totalProfit, 0);
    const todayItemsSold = todaySales.reduce((sum, s) => sum + s.products.length, 0);

    const totalSalesValue = products.reduce((sum, p) => {
      const calc = calculateProduct(p);
      return sum + (p.quantitySold * calc.sellingPrice);
    }, 0);

    const productsWithCalc = products.map(p => {
      const calc = calculateProduct(p);
      return {
        ...p,
        profitPerUnit: calc.profitPerUnit,
        stockRemaining: calc.stockRemaining,
        sellingPrice: calc.sellingPrice,
      };
    });

    return {
      products: productsWithCalc,
      todaysSales: {
        totalProfit: todayProfit,
        totalSales: totalSalesValue,
        itemsSold: todayItemsSold,
      },
      currency: settings.currentCurrency,
      exchangeRate: settings.exchangeRate,
      currencySymbol: getCurrencySymbol(),
    };
  }, [products, salesHistory, settings, getCurrencySymbol]);

  const generateAlerts = useCallback(async () => {
    if (products.length === 0) return;

    try {
      console.log('Generating proactive alerts...');
      const context = buildBusinessContext();

      const response = await fetch(
        `https://wtvglsneskjzhfudqpgv.supabase.co/functions/v1/ai-proactive-alerts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ context }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate alerts');
      }

      const data = await response.json();
      
      if (data.alerts && Array.isArray(data.alerts)) {
        console.log('Received alerts:', data.alerts);
        
        data.alerts.forEach((alert: any) => {
          addNotification({
            type: alert.type || 'info',
            title: alert.title || 'Business Insight',
            message: alert.message || '',
            priority: alert.priority || 'medium',
          });
        });

        if (data.alerts.length > 0) {
          toast({
            title: "New Insights Available",
            description: `${data.alerts.length} business ${data.alerts.length === 1 ? 'alert' : 'alerts'} generated`,
          });
        }
      }
    } catch (error) {
      console.error('Error generating proactive alerts:', error);
    }
  }, [products, buildBusinessContext, addNotification, toast]);

  // Generate alerts on mount if there are products
  useEffect(() => {
    const lastAlertTime = localStorage.getItem('last_alert_time');
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;

    if (products.length > 0 && (!lastAlertTime || now - parseInt(lastAlertTime) > sixHours)) {
      // Delay to avoid running on every mount
      const timer = setTimeout(() => {
        generateAlerts();
        localStorage.setItem('last_alert_time', now.toString());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [products.length]); // Only depend on products.length to avoid too frequent calls

  return { generateAlerts };
};
