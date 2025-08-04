import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UpgradePromptProps {
  feature: string;
  description: string;
  onUpgrade?: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  feature, 
  description, 
  onUpgrade 
}) => {
  const { t } = useLanguage();
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Scroll to subscription section
      const subscriptionSection = document.querySelector('[data-subscription-status]');
      if (subscriptionSection) {
        subscriptionSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
      <CardContent className="flex flex-col items-center text-center p-6">
        <Lock className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Premium Feature
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {description}
        </p>
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Premium Benefits:</h4>
          <ul className="text-sm text-gray-600 text-left list-disc list-inside space-y-1">
            {t.premiumBenefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
        <Button 
          onClick={handleUpgrade}
          className="bg-zimbabwe-green hover:bg-zimbabwe-darkGreen"
        >
          {t.upgradeToPlansAction || 'Upgrade to Premium'} - $1.99/month
        </Button>
      </CardContent>
    </Card>
  );
};