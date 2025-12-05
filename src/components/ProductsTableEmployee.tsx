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
import { Package, ArrowUp, ArrowDown } from 'lucide-react';

type SortColumn = 'name' | 'supplier' | 'stockQty';
type SortDirection = 'asc' | 'desc';

interface ProductsTableEmployeeProps {
  products: Product[];
  showTitle?: boolean;
}

interface SortableHeaderProps {
  column: SortColumn;
  currentSort: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
  children: React.ReactNode;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  column, currentSort, direction, onSort, children, className = '' 
}) => {
  const isActive = currentSort === column;
  return (
    <TableHead 
      className={`text-zimbabwe-darkGreen font-semibold cursor-pointer hover:bg-zimbabwe-green/10 select-none ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        {isActive && (
          direction === 'asc' 
            ? <ArrowUp className="h-3 w-3" /> 
            : <ArrowDown className="h-3 w-3" />
        )}
      </div>
    </TableHead>
  );
};

const ProductsTableEmployee: React.FC<ProductsTableEmployeeProps> = ({
  products,
  showTitle = true,
}) => {
  const { t } = useLanguage();
  const [sortColumn, setSortColumn] = React.useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedProducts = React.useMemo(() => {
    return [...products].sort((a, b) => {
      const calcA = calculateProduct(a);
      const calcB = calculateProduct(b);

      let comparison = 0;
      switch (sortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'supplier':
          comparison = (a.supplier || '').localeCompare(b.supplier || '');
          break;
        case 'stockQty':
          comparison = calcA.stockRemaining - calcB.stockRemaining;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [products, sortColumn, sortDirection]);

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
                <SortableHeader column="name" currentSort={sortColumn} direction={sortDirection} onSort={handleSort}>
                  {t.productName}
                </SortableHeader>
                <SortableHeader column="supplier" currentSort={sortColumn} direction={sortDirection} onSort={handleSort}>
                  {t.supplier}
                </SortableHeader>
                <SortableHeader column="stockQty" currentSort={sortColumn} direction={sortDirection} onSort={handleSort} className="text-center">
                  {t.stockQty}
                </SortableHeader>
                <TableHead className="text-zimbabwe-darkGreen font-semibold text-center">
                  Unit
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => {
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
