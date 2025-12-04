/**
 * Employee-friendly products table that only shows product names and stock quantities.
 * No prices, costs, or profit information is visible.
 */

import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, calculateProduct } from '@/lib/types';
import { Package } from 'lucide-react';

interface ProductsTableEmployeeProps {
  products: Product[];
  showTitle?: boolean;
}

const ProductsTableEmployee: React.FC<ProductsTableEmployeeProps> = ({
  products,
  showTitle = true,
}) => {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-gray-600">{t.noProducts}</p>
          </div>
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
                  {t.supplier}
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-center">
                  {t.stockQty}
                </TableHead>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-center">
                  Unit
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const calc = calculateProduct(product);
                
                return (
                  <TableRow key={product.id} className="hover:bg-zimbabwe-lightGreen/30">
                    <TableCell className="font-medium">
                      <div className="text-sm font-semibold">{product.name}</div>
                    </TableCell>
                    <TableCell className="text-sm">{product.supplier || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className={`text-lg font-bold ${calc.stockRemaining <= 5 ? 'text-destructive' : ''}`}>
                        {calc.stockRemaining}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of {product.quantityBought}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {product.unitOfMeasurement}
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

export default ProductsTableEmployee;
