
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
import { Edit, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Product, calculateProduct } from '@/lib/types';

type SortColumn = 'date' | 'name' | 'supplier' | 'stockQty' | 'costPerUnit' | 'sellingPrice' | 'stockValue';
type SortDirection = 'asc' | 'desc';

interface ProductsTableProps {
  products: Product[];
  onEditProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onAddStock?: (id: string) => void;
  showTitle?: boolean;
  readOnly?: boolean;
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

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
  onAddStock,
  showTitle = true,
  readOnly = false
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [sortColumn, setSortColumn] = React.useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');

  // Check if it's read-only by seeing if handlers are no-ops
  const isReadOnly = readOnly || (onEditProduct.toString().includes('{}') && onDeleteProduct.toString().includes('{}'));

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
      const effectiveSellingPriceA = a.sellingPrice || calcA.sellingPrice;
      const effectiveSellingPriceB = b.sellingPrice || calcB.sellingPrice;
      const stockValueA = calcA.stockRemaining * effectiveSellingPriceA;
      const stockValueB = calcB.stockRemaining * effectiveSellingPriceB;

      let comparison = 0;
      switch (sortColumn) {
        case 'date':
          const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
          const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'supplier':
          comparison = (a.supplier || '').localeCompare(b.supplier || '');
          break;
        case 'stockQty':
          comparison = calcA.stockRemaining - calcB.stockRemaining;
          break;
        case 'costPerUnit':
          comparison = calcA.costPerUnit - calcB.costPerUnit;
          break;
        case 'sellingPrice':
          comparison = effectiveSellingPriceA - effectiveSellingPriceB;
          break;
        case 'stockValue':
          comparison = stockValueA - stockValueB;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [products, sortColumn, sortDirection]);

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
                <SortableHeader column="date" currentSort={sortColumn} direction={sortDirection} onSort={handleSort}>
                  {t.dateOfPurchase}
                </SortableHeader>
                <SortableHeader column="name" currentSort={sortColumn} direction={sortDirection} onSort={handleSort}>
                  {t.productName}
                </SortableHeader>
                <SortableHeader column="supplier" currentSort={sortColumn} direction={sortDirection} onSort={handleSort}>
                  {t.supplier}
                </SortableHeader>
                <TableHead className="text-zimbabwe-darkGreen font-semibold">
                  {t.productDescription}
                </TableHead>
                <SortableHeader column="stockQty" currentSort={sortColumn} direction={sortDirection} onSort={handleSort} className="text-center">
                  {t.stockQty}
                </SortableHeader>
                <SortableHeader column="costPerUnit" currentSort={sortColumn} direction={sortDirection} onSort={handleSort} className="text-right">
                  {t.costPerUnit}
                </SortableHeader>
                <SortableHeader column="sellingPrice" currentSort={sortColumn} direction={sortDirection} onSort={handleSort} className="text-right">
                  {t.sellingPrice}
                </SortableHeader>
                <SortableHeader column="stockValue" currentSort={sortColumn} direction={sortDirection} onSort={handleSort} className="text-right">
                  {t.stockValue}
                </SortableHeader>
                {!isReadOnly && (
                  <TableHead className="text-zimbabwe-darkGreen font-semibold text-center">
                    {t.actions}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => {
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
                          {onAddStock && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAddStock(product.id)}
                              className="h-8 w-8 p-0 border-zimbabwe-green hover:bg-zimbabwe-green hover:text-white text-zimbabwe-green"
                              title={t.addStock || 'Add Stock'}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
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
