import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAppData } from '@/contexts/AppDataContext';
import { calculateProduct, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';

interface ProductSummaryItemProps {
  product: Product;
  calculateTotalSalesPerProduct: (productId: string) => {
    totalQuantitySold: number;
    totalQuantityDiscarded: number;
    totalProfit: number;
    totalSalesValue: number;
    totalCostValue: number;
    totalDiscardedValue: number;
  };
}

export const ProductSummaryItem: React.FC<ProductSummaryItemProps> = ({
  product,
  calculateTotalSalesPerProduct
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { updateProduct, deleteProduct } = useAppData();
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editQuantitySold, setEditQuantitySold] = React.useState(product.quantitySold.toString());
  const [editQuantityDiscarded, setEditQuantityDiscarded] = React.useState(product.quantityDiscarded.toString());

  const calc = calculateProduct(product);
  const totals = calculateTotalSalesPerProduct(product.id);

  const handleEdit = () => {
    const newQuantitySold = parseInt(editQuantitySold) || 0;
    const newQuantityDiscarded = parseInt(editQuantityDiscarded) || 0;
    
    updateProduct(product.id, {
      quantitySold: newQuantitySold,
      quantityDiscarded: newQuantityDiscarded
    });
    
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    deleteProduct(product.id);
  };

  return (
    <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center p-3 bg-zimbabwe-lightGreen rounded-lg">
      <div className="mb-2 md:mb-0 flex-1">
        <p className="font-semibold">{product.name}</p>
        <p className="text-sm text-gray-600">Supplier: {product.supplier}</p>
        <p className="text-sm text-gray-600">
          {t.sold}: {product.quantitySold} | {t.remaining}: {calc.stockRemaining}
        </p>
        <p className="text-xs font-medium text-zimbabwe-darkGreen mt-1">
          {t.salesQty}: {totals.totalQuantitySold}
        </p>
        <p className="text-xs font-medium text-red-600 mt-1">
          {t.discardedQty}: {totals.totalQuantityDiscarded}
        </p>
      </div>
      
      <div className="text-right ml-auto md:ml-0 flex-1">
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-sm">{t.salesValue}:</span>
            <span className="font-medium">{formatPrice(totals.totalSalesValue)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm">{t.costValue}:</span>
            <span className="font-medium">{formatPrice(totals.totalCostValue)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm">{t.discardedValue}:</span>
            <span className="font-medium text-red-600">{formatPrice(totals.totalDiscardedValue)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm">{t.dailyProfit}:</span>
            <span className="font-bold text-zimbabwe-darkGreen">{formatPrice(calc.dailyProfit)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-2 md:mt-0 md:ml-4">
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditQuantitySold(product.quantitySold.toString());
                setEditQuantityDiscarded(product.quantityDiscarded.toString());
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {product.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="quantitySold">Quantity Sold</Label>
                <Input
                  id="quantitySold"
                  type="number"
                  value={editQuantitySold}
                  onChange={(e) => setEditQuantitySold(e.target.value)}
                  min="0"
                  max={product.quantityBought}
                />
              </div>
              <div>
                <Label htmlFor="quantityDiscarded">Quantity Discarded</Label>
                <Input
                  id="quantityDiscarded"
                  type="number"
                  value={editQuantityDiscarded}
                  onChange={(e) => setEditQuantityDiscarded(e.target.value)}
                  min="0"
                  max={product.quantityBought}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};