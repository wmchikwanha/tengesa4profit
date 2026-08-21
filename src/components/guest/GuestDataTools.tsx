import React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, Trash2 } from 'lucide-react';
import { useGuestMode } from '@/contexts/GuestModeContext';
import { exportGuestData } from '@/lib/guestExport';
import { useToast } from '@/hooks/use-toast';

interface Props {
  /** Stacked full-width buttons (cards/walls) vs inline compact (banners). */
  layout?: 'inline' | 'stacked';
}

/**
 * Guest-only tools: download a copy of the phone-only records, or wipe them.
 * Never touches a signed-in account — only this device's guest store.
 */
export const GuestDataTools: React.FC<Props> = ({ layout = 'inline' }) => {
  const { clearGuestData } = useGuestMode();
  const { toast } = useToast();

  const handleExport = () => {
    const counts = exportGuestData();
    toast({
      title: 'Copy saved to your phone',
      description: `${counts.products} products and ${counts.sales} sales days downloaded.`,
    });
  };

  const handleReset = () => {
    clearGuestData();

    toast({
      title: 'This phone is now empty',
      description: 'All guest records were removed from this device.',
    });
    window.location.reload();
  };

  const wrapper = layout === 'stacked' ? 'flex flex-col gap-2 w-full' : 'flex flex-wrap gap-2';
  const btn = layout === 'stacked' ? 'w-full' : '';

  return (
    <div className={wrapper}>
      <Button variant="outline" size="sm" className={btn} onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Download my records
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className={`${btn} text-destructive border-destructive/40`}>
            <Trash2 className="mr-2 h-4 w-4" />
            Start again (erase this phone)
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erase everything on this phone?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes all guest products and sales kept on this device. No account is touched.
              This cannot be undone — download a copy first if you want to keep it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my records</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleReset}
            >
              Yes, erase everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
