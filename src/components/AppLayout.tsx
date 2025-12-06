
import * as React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBusiness } from '@/contexts/BusinessContext';
import LanguageToggle from './LanguageToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackForm } from './FeedbackForm';
import { Button } from '@/components/ui/button';
import { Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AboutDialog } from './AboutDialog';
import { AppFooter } from './AppFooter';
import { AIAssistant } from './AIAssistant';
import { AIAssistantLocked } from './AIAssistantLocked';
import { NotificationBell } from './NotificationBell';
import { useProactiveAlerts } from '@/hooks/useProactiveAlerts';

interface AppLayoutProps {
  children?: React.ReactNode;
  addProductContent: React.ReactNode | null;
  tallyProfitContent: React.ReactNode;
  marketplaceContent: React.ReactNode | null;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  addProductContent,
  tallyProfitContent,
  marketplaceContent,
}) => {
  const { t } = useLanguage();
  const { permissions, isOwner } = useBusiness();
  const navigate = useNavigate();
  // useProactiveAlerts(); // Disabled during testing to prevent automatic AI credit usage

  // Determine default tab based on permissions
  const defaultTab = addProductContent ? 'addProduct' : 'tallyProfit';
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  // Calculate number of visible tabs for grid columns
  const visibleTabs = [
    addProductContent !== null,
    true, // tallyProfit always visible
    marketplaceContent !== null,
  ].filter(Boolean).length;

  return (
    <div className="trader-container min-h-screen">
      <AboutDialog />
      {/* Show AI Assistant for premium users, locked version for free users */}
      {permissions.canUseAIAssistant ? <AIAssistant /> : <AIAssistantLocked />}
      
      <header className="text-center mb-6 relative">
        <div className="absolute top-0 right-4">
          <NotificationBell />
        </div>
        <h1 className="text-3xl app-title">Tengesa4Profit</h1>
        <p className="text-lg text-zimbabwe-darkGreen mt-2 font-medium">{t.appTagline}</p>
      </header>
      
      <LanguageToggle />
      
      <main>
        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList 
            className="w-full mb-6 bg-zimbabwe-lightGreen border border-zimbabwe-green h-16"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleTabs}, 1fr)` }}
          >
            {addProductContent !== null && (
              <TabsTrigger 
                value="addProduct" 
                className="text-sm sm:text-base text-zimbabwe-darkGreen data-[state=active]:bg-white data-[state=active]:text-zimbabwe-darkGreen data-[state=active]:shadow-sm h-14 flex items-center justify-center px-1 sm:px-2 text-center leading-tight whitespace-normal break-words"
              >
                <span className="text-center">{t.addProduct}</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="tallyProfit" 
              className="text-sm sm:text-base text-zimbabwe-darkGreen data-[state=active]:bg-white data-[state=active]:text-zimbabwe-darkGreen data-[state=active]:shadow-sm h-14 flex items-center justify-center px-1 sm:px-2 text-center leading-tight whitespace-normal break-words"
            >
              <span className="text-center">{t.tallyProfit}</span>
            </TabsTrigger>
            {marketplaceContent !== null && (
              <TabsTrigger 
                value="marketplace" 
                className="text-sm sm:text-base text-zimbabwe-darkGreen data-[state=active]:bg-white data-[state=active]:text-zimbabwe-darkGreen data-[state=active]:shadow-sm h-14 flex items-center justify-center px-1 sm:px-2 text-center leading-tight whitespace-normal break-words"
              >
                <span className="text-center">{t.marketplace}</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          {addProductContent !== null && (
            <TabsContent value="addProduct">
              {addProductContent}
            </TabsContent>
          )}
          
          <TabsContent value="tallyProfit">
            {tallyProfitContent}
          </TabsContent>
          
          {marketplaceContent !== null && (
            <TabsContent value="marketplace">
              {marketplaceContent}
            </TabsContent>
          )}
        </Tabs>
        
        <div className="mt-8 pb-4 flex justify-center gap-3">
          {isOwner && <FeedbackForm />}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile')}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
        
        <AppFooter />
      </main>
    </div>
  );
};

export default AppLayout;
