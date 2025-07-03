
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building, User, Mail } from 'lucide-react';
import { MarketplaceProduct, ProductInquiry } from '@/lib/marketplace-types';

interface ContactSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketplaceProduct;
}

export const ContactSupplierModal: React.FC<ContactSupplierModalProps> = ({ 
  isOpen, 
  onClose, 
  product 
}) => {
  const { addInquiry } = useMarketplace();
  const [formData, setFormData] = React.useState({
    traderName: '',
    traderEmail: '',
    traderPhone: '',
    message: '',
    quantity: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const inquiry: ProductInquiry = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      traderId: 'current-trader', // In real app, this would be from auth
      traderName: formData.traderName,
      traderEmail: formData.traderEmail,
      traderPhone: formData.traderPhone,
      supplierId: product.supplierId,
      message: formData.message,
      quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addInquiry(inquiry);
    
    // Reset form and close modal
    setFormData({
      traderName: '',
      traderEmail: '',
      traderPhone: '',
      message: '',
      quantity: '',
    });
    onClose();
    
    // Show success message
    alert('Your inquiry has been sent to the supplier!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Supplier</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Product Info */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <h4 className="font-medium">{product.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{product.category}</Badge>
              <span className="text-sm font-medium text-zimbabwe-green">
                ${product.price}/{product.unit}
              </span>
            </div>
          </div>

          {/* Supplier Info */}
          {product.supplierProfile && (
            <div className="border rounded-lg p-3 bg-blue-50">
              <h5 className="font-medium flex items-center gap-2 mb-2">
                <Building className="w-4 h-4" />
                Supplier
              </h5>
              <div className="text-sm space-y-1">
                {product.supplierProfile.showBusinessName && (
                  <div className="flex items-center gap-2">
                    <Building className="w-3 h-3 text-gray-400" />
                    <span>{product.supplierProfile.businessName}</span>
                  </div>
                )}
                {product.supplierProfile.showContactPerson && (
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span>{product.supplierProfile.contactPerson}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="trader-label">Your Name *</label>
              <Input
                value={formData.traderName}
                onChange={(e) => setFormData(prev => ({ ...prev, traderName: e.target.value }))}
                className="trader-input"
                required
              />
            </div>

            <div>
              <label className="trader-label">Your Email *</label>
              <Input
                type="email"
                value={formData.traderEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, traderEmail: e.target.value }))}
                className="trader-input"
                required
              />
            </div>

            <div>
              <label className="trader-label">Your Phone</label>
              <Input
                value={formData.traderPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, traderPhone: e.target.value }))}
                className="trader-input"
              />
            </div>

            <div>
              <label className="trader-label">Quantity Needed</label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className="trader-input"
                placeholder={`e.g., 50 ${product.unit}`}
              />
            </div>

            <div>
              <label className="trader-label">Message *</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="trader-input"
                rows={4}
                placeholder="Hi, I'm interested in your product. Please provide more details..."
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-zimbabwe-green hover:bg-zimbabwe-darkGreen">
                <Mail className="w-4 h-4 mr-2" />
                Send Inquiry
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
