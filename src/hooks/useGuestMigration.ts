import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { useGuestMode } from '@/contexts/GuestModeContext';
import { guestStore } from '@/lib/guestStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type MigrationStepKey = 'products' | 'sales' | 'cleanup';
export type MigrationStepState = 'pending' | 'active' | 'done' | 'error';

export interface MigrationStep {
  key: MigrationStepKey;
  label: string;
  count: number;
  state: MigrationStepState;
}

export interface MigrationStatus {
  migrating: boolean;
  finished: boolean;
  error: string | null;
  steps: MigrationStep[];
}

/**
 * When a former guest signs in / signs up, copy the data that lived only on their
 * phone into their new business, then wipe the local guest copy.
 */
export function useGuestMigration() {
  const { user } = useAuth();
  const { businessId, isOwner } = useBusiness();
  const { clearGuestData } = useGuestMode();
  const { toast } = useToast();
  const [status, setStatus] = useState<MigrationStatus>({
    migrating: false,
    finished: false,
    error: null,
    steps: [],
  });
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !user || !businessId || !isOwner) return;
    if (!guestStore.hasData()) return;

    done.current = true;
    const migrate = async () => {
      const products = guestStore.getProducts();
      const sales = guestStore.getSales();

      const steps: MigrationStep[] = [
        { key: 'products', label: 'Copying your products', count: products.length, state: 'pending' },
        { key: 'sales', label: 'Copying your sales days', count: sales.length, state: 'pending' },
        { key: 'cleanup', label: 'Finishing up', count: 0, state: 'pending' },
      ];
      const setStep = (key: MigrationStepKey, state: MigrationStepState) => {
        const i = steps.findIndex(s => s.key === key);
        if (i >= 0) steps[i] = { ...steps[i], state };
        setStatus(s => ({ ...s, steps: [...steps] }));
      };

      setStatus({ migrating: true, finished: false, error: null, steps: [...steps] });

      try {
        setStep('products', 'active');
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
        setStep('products', 'done');

        setStep('sales', 'active');
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
        setStep('sales', 'done');

        setStep('cleanup', 'active');
        clearGuestData();
        setStep('cleanup', 'done');

        setStatus(s => ({ ...s, migrating: false, finished: true }));
        toast({
          title: 'Your records are saved',
          description: 'Everything from your free trial is now in your account.',
        });
      } catch (error) {
        console.error('Guest data migration failed:', error);
        done.current = false;
        const active = steps.find(s => s.state === 'active');
        if (active) setStep(active.key, 'error');
        setStatus(s => ({
          ...s,
          migrating: false,
          finished: false,
          error: 'We could not copy everything yet. Your records are still safe on this phone.',
        }));
        toast({
          title: 'Could not save trial data yet',
          description: 'Your records are still safe on this phone. We will try again next time.',
          variant: 'destructive',
        });
      }
    };

    migrate();
  }, [user?.id, businessId, isOwner]);

  return { migrating: status.migrating, status };
}
