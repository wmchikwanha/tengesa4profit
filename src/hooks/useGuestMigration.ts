import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { useGuestMode } from '@/contexts/GuestModeContext';
import { guestStore } from '@/lib/guestStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * When a former guest signs in / signs up, copy the data that lived only on their
 * phone into their new business, then wipe the local guest copy.
 */
export function useGuestMigration() {
  const { user } = useAuth();
  const { businessId, isOwner } = useBusiness();
  const { clearGuestData } = useGuestMode();
  const { toast } = useToast();
  const [migrating, setMigrating] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !user || !businessId || !isOwner) return;
    if (!guestStore.hasData()) return;

    done.current = true;
    const migrate = async () => {
      setMigrating(true);
      try {
        const products = guestStore.getProducts();
        const sales = guestStore.getSales();

        if (products.length > 0) {
          const rows = products.map(p => ({
            business_id: businessId,
            name: p.name,
            supplier: p.supplier || null,
            purchase_date: p.purchaseDate || null,
            quantity_bought: p.quantityBought || 0,
            unit_of_measurement: p.unitOfMeasurement || 'piece',
            buying_price: p.buyingPrice || 0,
            transport_cost: p.transportCost || 0,
            stall_fee: p.stallFee || 0,
            markup_percentage: p.markupPercentage || 0,
            selling_price: p.sellingPrice || null,
            quantity_sold: p.quantitySold || 0,
            quantity_discarded: p.quantityDiscarded || 0,
            description: p.description || null,
          }));
          const { error } = await supabase.from('products').insert(rows);
          if (error) throw error;
        }

        if (sales.length > 0) {
          const rows = sales.map(s => ({
            business_id: businessId,
            date: s.date,
            recorded_by: user.id,
            products: JSON.parse(JSON.stringify(s.products)),
            total_profit: s.totalProfit || 0,
          }));
          const { error } = await supabase.from('sales_history').insert(rows);
          if (error) throw error;
        }

        clearGuestData();
        toast({
          title: 'Your records are saved',
          description: 'Everything from your free trial is now in your account.',
        });
        window.location.reload();
      } catch (error) {
        console.error('Guest data migration failed:', error);
        done.current = false;
        toast({
          title: 'Could not save trial data yet',
          description: 'Your records are still safe on this phone. We will try again next time.',
          variant: 'destructive',
        });
      } finally {
        setMigrating(false);
      }
    };

    migrate();
  }, [user?.id, businessId, isOwner]);

  return { migrating };
}
