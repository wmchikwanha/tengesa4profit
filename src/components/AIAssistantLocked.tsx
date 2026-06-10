import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAnalytics } from '@/hooks/useAnalytics';

export const AIAssistantLocked: React.FC = () => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { t } = useLanguage();
  const { trackEvent } = useAnalytics();

  const handleOpen = () => {
    trackEvent('ai_locked_tapped');
    setShowUpgradePrompt(true);
  };

  const handleUpgrade = () => {
    trackEvent('upgrade_clicked', { source: 'ai_locked' });
    setShowUpgradePrompt(false);
    const subscriptionSection = document.querySelector('[data-subscription-status]');
    if (subscriptionSection) {
      subscriptionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-4 right-4 z-50 rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-muted hover:bg-muted/80 flex flex-col items-center justify-center gap-0.5 border border-border"
        aria-label="AI Business Assistant (Premium)"
        onClick={handleOpen}
      >
        <div className="relative">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
          <Lock className="h-3 w-3 text-muted-foreground absolute -bottom-1 -right-1" />
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground">AI</span>
      </Button>

      <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-zimbabwe-gold" />
              {t.tierAIAssistant || 'AI Business Assistant'}
            </DialogTitle>
            <DialogDescription>
              Get instant business insights, profit summaries, and personalized advice from your AI assistant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">AI Assistant can help you with:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Profit summaries and insights</li>
                <li>• Stock level checks</li>
                <li>• Product performance analysis</li>
                <li>• Business advice</li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Unlock with Premium</p>
              <div className="mb-3">
                <span className="text-lg text-muted-foreground line-through mr-2">$2.99</span>
                <span className="text-2xl font-bold text-zimbabwe-darkGreen">$1.99</span>
                <span className="text-muted-foreground">/{t.month}</span>
              </div>
              <p className="text-xs text-zimbabwe-green font-medium mb-3">
                Early Adopter Price!
              </p>
              <Button 
                onClick={handleUpgrade}
                className="w-full bg-zimbabwe-green hover:bg-zimbabwe-darkGreen"
              >
                {t.upgradeToPlansAction || 'Upgrade to Premium'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
