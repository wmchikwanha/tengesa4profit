import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ isOpen, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms and Conditions - Tengesa4Profit</DialogTitle>
          <DialogDescription>
            Last Updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
              <p>
                By accessing and using Tengesa4Profit ("the Application"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Application.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Service Description</h3>
              <p>
                Tengesa4Profit is a business management application designed to help traders and vendors in Zimbabwe manage inventory, track sales, calculate profits, and connect with suppliers through our marketplace feature.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Trial Period</h3>
              <p>
                New users receive a 1-day free trial with full access to all premium features. After the trial period expires, users must subscribe to continue accessing premium features. A grace period may be provided at our discretion.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Subscription and Pricing</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Basic subscription: $1.99 USD per month (30 days)</li>
                <li>Subscription provides access to all premium features including PDF reports, marketplace, and supplier dashboard</li>
                <li>Prices are subject to change with 30 days notice</li>
                <li>Subscriptions auto-renew unless cancelled</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Payment Terms</h3>
              <p>
                Payments are processed securely through Stripe and our authorized payment partners. We accept:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Credit/Debit Cards (Visa, MasterCard)</li>
                <li>Mobile Money (EcoCash, PayNow)</li>
                <li>PayPal</li>
              </ul>
              <p className="mt-2">
                All payments are non-refundable except where required by law or at our sole discretion.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. User Responsibilities</h3>
              <p>You agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the Application in compliance with all applicable laws</li>
                <li>Not misuse or attempt to exploit the Application</li>
                <li>Not share your account with unauthorized persons</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Data and Privacy</h3>
              <p>
                We are committed to protecting your privacy. Your personal information and business data are:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                <li>Stored securely using industry-standard encryption</li>
                <li>Never shared with third parties without your explicit consent</li>
                <li>Used only to provide and improve our services</li>
                <li>Subject to our Privacy Policy</li>
              </ul>
              <p className="mt-2">
                You retain all rights to your business data. You may export or delete your data at any time.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Marketplace Terms</h3>
              <p>
                When using the marketplace feature:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                <li>Suppliers are responsible for the accuracy of their product listings</li>
                <li>We facilitate connections but are not a party to transactions</li>
                <li>Users must verify product details directly with suppliers</li>
                <li>We are not liable for disputes between traders and suppliers</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Intellectual Property</h3>
              <p>
                All content, features, and functionality of Tengesa4Profit are owned by us and protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. Disclaimer of Warranties</h3>
              <p>
                The Application is provided "as is" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Uninterrupted or error-free operation</li>
                <li>Accuracy of profit calculations (users should verify)</li>
                <li>Compatibility with all devices or browsers</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">11. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Application.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">12. Termination</h3>
              <p>
                You may cancel your subscription at any time through your account settings or by contacting us. Your access will continue until the end of your current billing period. We reserve the right to suspend or terminate accounts for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Violation of these terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of subscription fees</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">13. Changes to Terms</h3>
              <p>
                We may update these terms from time to time. Significant changes will be notified via email or in-app notification. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">14. Governing Law</h3>
              <p>
                These terms are governed by the laws of Zimbabwe. Any disputes shall be resolved in the courts of Zimbabwe.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">15. Contact Information</h3>
              <p>
                For questions, concerns, or support regarding these terms or the Application, please contact us through the feedback form in the app or via our support channels.
              </p>
            </section>

            <section className="border-t pt-4 mt-4">
              <p className="text-xs text-muted-foreground">
                By clicking "I agree" or by using Tengesa4Profit, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
