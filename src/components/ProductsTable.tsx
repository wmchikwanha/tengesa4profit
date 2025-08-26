
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { Product, calculateProduct } from '@/lib/types';

interface ProductsTableProps {
  products: Product[];
  onEditProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  showTitle?: boolean;
  readOnly?: boolean;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
  showTitle = true,
  readOnly = false
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // Check if it's read-only by seeing if handlers are no-ops
  const isReadOnly = readOnly || (onEditProduct.toString().includes('{}') && onDeleteProduct.toString().includes('{}'));

  if (products.length === 0) {
    return (
      <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
        <CardContent className="pt-6">
          <p className="text-gray-600 text-center">{t.noProducts}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-zimbabwe-green">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-zimbabwe-darkGreen">
            {t.productsList}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-zimbabwe-lightGreen">
              <TableRow>
                <TableHead className="text-zimbabwe-darkGreen font-semibold">
                  {t.dateOfPurchase}
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold">
                  {t.productName}
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold">
                  {t.supplier}
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold">
                  Description
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-center">
                  {t.stockQty}
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-right">
                  {t.costPerUnit}
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-right">
                  {t.sellingPrice}
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-right">
                  {t.stockValue}
                </TableHead>
                {!isReadOnly && (
                  <TableHead className="text-zimbabwe-darkGreen font-semibold text-center">
                    {t.actions}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const calc = calculateProduct(product);
                // Use the calculated selling price if no selling price is set
                const effectiveSellingPrice = product.sellingPrice || calc.sellingPrice;
                const stockValue = calc.stockRemaining * effectiveSellingPrice;
                
                return (
                  <TableRow key={product.id} className="hover:bg-zimbabwe-lightGreen/30">
                    <TableCell className="font-medium">
                      <div className="text-sm text-gray-600">
                        {product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString() : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="text-sm font-semibold">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.unitOfMeasurement}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{product.supplier}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {product.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-medium">{calc.stockRemaining}</div>
                      <div className="text-xs text-gray-500">
                        of {product.quantityBought}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatPrice(calc.costPerUnit)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatPrice(effectiveSellingPrice)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatPrice(stockValue)}
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditProduct(product.id)}
                            className="h-8 w-8 p-0 border-zimbabwe-green hover:bg-zimbabwe-lightGreen text-zimbabwe-darkGreen"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDeleteProduct(product.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsTable;
