
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { SupplierProfile } from '@/lib/marketplace-types';

export const SupplierProfileForm: React.FC = () => {
  const { supplierProfile, setSupplierProfile, marketplaceProducts, updateMarketplaceProduct } = useMarketplace();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = React.useState<Partial<SupplierProfile>>(
    supplierProfile || {
      businessName: '',
      contactPerson: '',
      address: '',
      phoneNumber: '',
      email: '',
      description: '',
      showBusinessName: true,
      showContactPerson: true,
      showAddress: false,
      showPhoneNumber: true,
      showEmail: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profile: SupplierProfile = {
      id: supplierProfile?.id || crypto.randomUUID(),
      userId: 'current-user', // In real app, this would be from auth
      businessName: formData.businessName || '',
      contactPerson: formData.contactPerson || '',
      address: formData.address || '',
      phoneNumber: formData.phoneNumber || '',
      email: formData.email || '',
      description: formData.description || '',
      showBusinessName: true, // Always show
      showContactPerson: true, // Always show
      showAddress: formData.showAddress || false,
      showPhoneNumber: true, // Always show
      showEmail: formData.showEmail || false,
      isActive: true,
      subscriptionStatus: 'trial',
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: supplierProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Update supplier profile first
    setSupplierProfile(profile);
    
    // Force immediate update of all marketplace products with new supplier profile
    // This ensures visibility changes are reflected immediately
    const updatedProducts = marketplaceProducts.map(product => {
      if (product.supplierId === profile.id) {
        return { ...product, supplierProfile: profile, updatedAt: new Date().toISOString() };
      }
      return product;
    });
    
    // Batch update all products at once for immediate effect
    if (updatedProducts.length > 0) {
      marketplaceProducts.forEach(product => {
        if (product.supplierId === profile.id) {
          updateMarketplaceProduct(product.id, { 
            supplierProfile: { ...profile },
            updatedAt: new Date().toISOString()
          });
        }
      });
    }
    
    toast({
      title: "Success",
      description: t.profileUpdated,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="trader-label break-words">{t.businessName} *</label>
          <Input
            value={formData.businessName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            className="trader-input"
            required
          />
        </div>

        <div>
          <label className="trader-label break-words">{t.contactPerson} *</label>
          <Input
            value={formData.contactPerson || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
            className="trader-input"
            required
          />
        </div>

        <div>
          <label className="trader-label break-words">{t.phoneNumber} *</label>
          <Input
            value={formData.phoneNumber || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            className="trader-input"
            required
          />
        </div>

        <div>
          <label className="trader-label break-words">{t.email}</label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="trader-input"
          />
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              checked={formData.showEmail}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showEmail: !!checked }))}
            />
            <label className="text-sm break-words">Show email to vendors</label>
          </div>
        </div>
      </div>

      <div>
        <label className="trader-label break-words">{t.address}</label>
        <Textarea
          value={formData.address || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="trader-input"
          rows={3}
        />
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            checked={formData.showAddress}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showAddress: !!checked }))}
          />
          <label className="text-sm break-words">Show address to vendors</label>
        </div>
      </div>

      <div>
        <label className="trader-label break-words">{t.businessDescription}</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="trader-input"
          rows={3}
          placeholder="Describe your business and products..."
        />
      </div>

      <Button type="submit" className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen">
        {t.saveProfile}
      </Button>
    </form>
  );
};
