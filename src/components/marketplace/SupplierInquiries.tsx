
import * as React from 'react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, User, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ProductInquiry, InquiryResponse } from '@/lib/marketplace-types';

export const SupplierInquiries: React.FC = () => {
  const { 
    supplierProfile, 
    inquiries, 
    updateInquiryStatus, 
    addInquiryResponse,
    marketplaceProducts
  } = useMarketplace();

  const [selectedInquiry, setSelectedInquiry] = React.useState<ProductInquiry | null>(null);
  const [responseForm, setResponseForm] = React.useState({
    message: '',
    priceQuote: '',
    availabilityNotes: '',
  });

  const supplierInquiries = inquiries.filter(
    inquiry => inquiry.supplierId === supplierProfile?.id
  );

  const getProductName = (productId: string) => {
    const product = marketplaceProducts.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const handleRespondToInquiry = (inquiry: ProductInquiry) => {
    setSelectedInquiry(inquiry);
    setResponseForm({
      message: '',
      priceQuote: '',
      availabilityNotes: '',
    });
  };

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    const response: InquiryResponse = {
      id: crypto.randomUUID(),
      inquiryId: selectedInquiry.id,
      supplierId: supplierProfile!.id,
      message: responseForm.message,
      priceQuote: responseForm.priceQuote ? parseFloat(responseForm.priceQuote) : undefined,
      availabilityNotes: responseForm.availabilityNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    addInquiryResponse(response);
    updateInquiryStatus(selectedInquiry.id, 'responded');
    setSelectedInquiry(null);
    alert('Response sent successfully!');
  };

  const getStatusIcon = (status: ProductInquiry['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'responded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ProductInquiry['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Inquiries ({supplierInquiries.length})</h3>
        <Badge variant="outline">
          {supplierInquiries.filter(i => i.status === 'pending').length} Pending
        </Badge>
      </div>

      {supplierInquiries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-zimbabwe-darkGreen">No inquiries yet. Traders will contact you about your products here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {supplierInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-zimbabwe-green" />
                    <h4 className="font-semibold">{getProductName(inquiry.productId)}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(inquiry.status)}
                    <Badge className={getStatusColor(inquiry.status)}>
                      {inquiry.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3 text-gray-400" />
                    <span><strong>From:</strong> {inquiry.traderName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span>{inquiry.traderEmail}</span>
                  </div>
                  {inquiry.quantity && (
                    <div className="text-sm">
                      <strong>Quantity:</strong> {inquiry.quantity}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm"><strong>Message:</strong></p>
                  <p className="text-sm text-gray-600 mt-1">{inquiry.message}</p>
                </div>

                {inquiry.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespondToInquiry(inquiry)}
                      className="bg-zimbabwe-green hover:bg-zimbabwe-darkGreen"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Respond
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateInquiryStatus(inquiry.id, 'closed')}
                    >
                      Mark as Closed
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Response Modal */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Inquiry</DialogTitle>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-sm"><strong>From:</strong> {selectedInquiry.traderName}</p>
                <p className="text-sm"><strong>Product:</strong> {getProductName(selectedInquiry.productId)}</p>
                {selectedInquiry.quantity && (
                  <p className="text-sm"><strong>Quantity:</strong> {selectedInquiry.quantity}</p>
                )}
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <label className="trader-label">Your Response *</label>
                  <Textarea
                    value={responseForm.message}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, message: e.target.value }))}
                    className="trader-input"
                    rows={4}
                    placeholder="Thank you for your interest in our product..."
                    required
                  />
                </div>

                <div>
                  <label className="trader-label">Price Quote (Optional)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={responseForm.priceQuote}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, priceQuote: e.target.value }))}
                    className="trader-input"
                    placeholder="Special pricing for this inquiry"
                  />
                </div>

                <div>
                  <label className="trader-label">Availability Notes (Optional)</label>
                  <Textarea
                    value={responseForm.availabilityNotes}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, availabilityNotes: e.target.value }))}
                    className="trader-input"
                    rows={2}
                    placeholder="Delivery timeline, minimum order quantity, etc."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-zimbabwe-green hover:bg-zimbabwe-darkGreen">
                    Send Response
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSelectedInquiry(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
