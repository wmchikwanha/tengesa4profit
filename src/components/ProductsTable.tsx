
import React from 'react';
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
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
  showTitle = true
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

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
                  {t.productName}
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold">
                  Supplier
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-center">
                  Stock Qty
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-right">
                  Cost/Unit
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-right">
                  Selling Price
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-right">
                  Stock Value
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const calc = calculateProduct(product);
                const stockValue = calc.stockRemaining * product.sellingPrice;
                
                return (
                  <TableRow key={product.id} className="hover:bg-zimbabwe-lightGreen/30">
                    <TableCell className="font-medium">
                      <div>
                        <div className="text-sm font-semibold">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.unitOfMeasurement}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{product.supplier}</TableCell>
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
                      {formatPrice(product.sellingPrice)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatPrice(stockValue)}
                    </TableCell>
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
