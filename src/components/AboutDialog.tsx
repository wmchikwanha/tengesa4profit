import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const AboutDialog = () => {
  const { t } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 h-10 w-10 rounded-full shadow-lg z-50"
          aria-label="About this application"
        >
          <Info className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Tengesa4Profit</DialogTitle>
          <DialogDescription className="text-base mt-4 space-y-4">
            <p className="font-medium text-foreground">
              Your Complete Trading & Marketplace Solution
            </p>
            
            <div className="space-y-3 text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-1">Product Management</p>
                <p className="text-sm">Track inventory, costs, and pricing across multiple currencies.</p>
              </div>
              
              <div>
                <p className="font-semibold text-foreground mb-1">Profit Calculator</p>
                <p className="text-sm">Calculate profits, generate daily reports, and monitor sales performance.</p>
              </div>
              
              <div>
                <p className="font-semibold text-foreground mb-1">Marketplace</p>
                <p className="text-sm">Connect traders with suppliers, browse products, and manage inquiries.</p>
              </div>
              
              <div>
                <p className="font-semibold text-foreground mb-1">Multi-Language Support</p>
                <p className="text-sm">Available in English, Shona, and Ndebele.</p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground pt-4 border-t">
              Built for traders and suppliers to streamline operations and maximize profitability.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
