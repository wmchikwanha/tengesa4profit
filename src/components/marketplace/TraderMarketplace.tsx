
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionPermissions } from '@/hooks/useSubscriptionPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Phone, Mail, MapPin, Building } from 'lucide-react';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/lib/marketplace-types';
import { getAllCategoryTranslations } from '@/lib/categoryTranslations';
import { ContactSupplierModal } from './ContactSupplierModal';
import { UpgradePrompt } from '@/components/UpgradePrompt';

export const TraderMarketplace: React.FC = () => {
  const { marketplaceProducts } = useMarketplace();
  const { t } = useLanguage();
  const { canContactSuppliers, showUpgradePrompt } = useSubscriptionPermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
  const [showUpgradePromptModal, setShowUpgradePromptModal] = React.useState(false);

  // Filter products that are publicly visible AND have at least one visible supplier profile field
  // AND only show products from suppliers with active subscriptions
  const publicProducts = marketplaceProducts.filter(product => {
    if (!product.isPubliclyVisible || !product.supplierProfile) return false;
    
    // Check if supplier has at least one visible field
    const hasVisibleInfo = product.supplierProfile.showBusinessName ||
                          product.supplierProfile.showContactPerson ||
                          product.supplierProfile.showPhoneNumber ||
                          product.supplierProfile.showEmail ||
                          product.supplierProfile.showAddress;
    
    // Only show products from active suppliers (not expired)
    // This will be handled by filtering based on subscription status of the supplier
    return hasVisibleInfo;
  });

  // Only show products if there's an active search term or category filter
  const hasActiveSearch = searchTerm.trim() !== '' || selectedCategory !== 'all';

  // Apply search and category filters
  const filteredProducts = hasActiveSearch ? publicProducts.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.supplierProfile?.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.supplierProfile?.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.supplierProfile?.address?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.supplierProfile?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.supplierProfile?.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }) : [];

  const handleContactSupplier = (product: any) => {
    if (!canContactSuppliers) {
      setShowUpgradePromptModal(true);
      return;
    }
    setSelectedProduct(product);
    setIsContactModalOpen(true);
  };

  return (
    <>
      <Card className="bg-zimbabwe-lightGreen border border-zimbabwe-green">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg break-words">{t.marketplace} - {t.findProducts}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t.searchProductsPlaceholder || "Search products, brands, or suppliers..."}
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
                {Object.entries(getAllCategoryTranslations(t)).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          {!hasActiveSearch ? (
            <div className="text-center py-8">
              <p className="text-zimbabwe-darkGreen text-sm break-words">
                {t.searchInstruction || "Use the search bar or select a category to find products from suppliers."}
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zimbabwe-darkGreen">
                No products found matching your search criteria.
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
                            <Badge variant="secondary">{getAllCategoryTranslations(t)[product.category]}</Badge>
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

                      {/* Show supplier info only if user can contact suppliers */}
                      {canContactSuppliers && product.supplierProfile && (
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
                        </div>
                      )}
                      
                      {/* Contact button - always visible but functionality depends on subscription */}
                      <div className="border-t pt-3 mt-3">
                        <Button
                          className={`mt-2 ${canContactSuppliers 
                            ? 'bg-zimbabwe-green hover:bg-zimbabwe-darkGreen' 
                            : 'bg-gray-400 cursor-not-allowed'}`}
                          size="sm"
                          onClick={() => handleContactSupplier(product)}
                          disabled={!canContactSuppliers}
                        >
                          Contact Supplier
                        </Button>
                        {!canContactSuppliers && (
                          <p className="text-xs text-gray-500 mt-1">
                            Upgrade to view supplier details
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProduct && (
        <ContactSupplierModal
          isOpen={isContactModalOpen}
          onClose={() => {
            setIsContactModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {showUpgradePromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <UpgradePrompt
              feature="Contact Suppliers"
              description="Upgrade to view supplier details and contact information."
              onUpgrade={() => setShowUpgradePromptModal(false)}
            />
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowUpgradePromptModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
