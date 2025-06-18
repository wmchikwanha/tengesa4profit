
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { SupplierProfile } from '@/lib/marketplace-types';

export const SupplierProfileForm: React.FC = () => {
  const { supplierProfile, setSupplierProfile } = useMarketplace();
  
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
      showBusinessName: formData.showBusinessName || false,
      showContactPerson: formData.showContactPerson || false,
      showAddress: formData.showAddress || false,
      showPhoneNumber: formData.showPhoneNumber || false,
      showEmail: formData.showEmail || false,
      isActive: true,
      subscriptionStatus: 'trial',
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: supplierProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setSupplierProfile(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="trader-label">Business Name *</label>
          <Input
            value={formData.businessName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            className="trader-input"
            required
          />
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              checked={formData.showBusinessName}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showBusinessName: !!checked }))}
            />
            <label className="text-sm">Show to traders</label>
          </div>
        </div>

        <div>
          <label className="trader-label">Contact Person *</label>
          <Input
            value={formData.contactPerson || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
            className="trader-input"
            required
          />
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              checked={formData.showContactPerson}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showContactPerson: !!checked }))}
            />
            <label className="text-sm">Show to traders</label>
          </div>
        </div>

        <div>
          <label className="trader-label">Phone Number *</label>
          <Input
            value={formData.phoneNumber || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            className="trader-input"
            required
          />
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              checked={formData.showPhoneNumber}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showPhoneNumber: !!checked }))}
            />
            <label className="text-sm">Show to traders</label>
          </div>
        </div>

        <div>
          <label className="trader-label">Email</label>
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
            <label className="text-sm">Show to traders</label>
          </div>
        </div>
      </div>

      <div>
        <label className="trader-label">Address</label>
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
          <label className="text-sm">Show to traders</label>
        </div>
      </div>

      <div>
        <label className="trader-label">Business Description</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="trader-input"
          rows={3}
          placeholder="Describe your business and products..."
        />
      </div>

      <Button type="submit" className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen">
        Save Profile
      </Button>
    </form>
  );
};
