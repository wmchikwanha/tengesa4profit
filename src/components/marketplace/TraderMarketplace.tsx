
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Phone, Mail, MapPin, Building } from 'lucide-react';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/lib/marketplace-types';

export const TraderMarketplace: React.FC = () => {
  const { marketplaceProducts } = useMarketplace();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  // Filter products that are publicly visible
  const publicProducts = marketplaceProducts.filter(product => product.isPubliclyVisible);

  // Apply search and category filters
  const filteredProducts = publicProducts.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.supplierProfile?.businessName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleContactSupplier = (supplierId: string) => {
    // This will be enhanced in Phase 3 with actual contact functionality
    alert(`Contact feature coming soon! Supplier ID: ${supplierId}`);
  };

  return (
    <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
      <CardHeader>
        <CardTitle>Marketplace - Find Products</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products, brands, or suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 trader-input"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 trader-input">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zimbabwe-darkGreen">
              {searchTerm || selectedCategory !== 'all' 
                ? "No products found matching your search criteria." 
                : "No products available yet. Check back later for new listings!"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zimbabwe-darkGreen">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            
            <div className="grid gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border border-gray-200 hover:border-zimbabwe-green transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{PRODUCT_CATEGORIES[product.category]}</Badge>
                          {product.brand && (
                            <Badge variant="outline">{product.brand}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-zimbabwe-green">
                          ${product.price}
                        </p>
                        <p className="text-sm text-gray-500">per {product.unit}</p>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-gray-600 mb-3">{product.description}</p>
                    )}

                    {product.supplierProfile && (
                      <div className="border-t pt-3 mt-3">
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Supplier Information
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {product.supplierProfile.showBusinessName && (
                            <div className="flex items-center gap-2">
                              <Building className="w-3 h-3 text-gray-400" />
                              <span>{product.supplierProfile.businessName}</span>
                            </div>
                          )}
                          {product.supplierProfile.showContactPerson && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">Contact:</span>
                              <span>{product.supplierProfile.contactPerson}</span>
                            </div>
                          )}
                          {product.supplierProfile.showPhoneNumber && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{product.supplierProfile.phoneNumber}</span>
                            </div>
                          )}
                          {product.supplierProfile.showEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span>{product.supplierProfile.email}</span>
                            </div>
                          )}
                          {product.supplierProfile.showAddress && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span>{product.supplierProfile.address}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          className="mt-3 bg-zimbabwe-green hover:bg-zimbabwe-darkGreen"
                          size="sm"
                          onClick={() => handleContactSupplier(product.supplierId)}
                        >
                          Contact Supplier
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
