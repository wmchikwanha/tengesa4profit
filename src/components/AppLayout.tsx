
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AppLayoutProps {
  children?: React.ReactNode;
  addProductContent: React.ReactNode;
  tallyProfitContent: React.ReactNode;
  languageSettingsContent: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  addProductContent,
  tallyProfitContent,
  languageSettingsContent,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = React.useState('addProduct');

  return (
    <div className="trader-container min-h-screen">
      <header className="text-center mb-6">
        <h1 className="text-3xl app-title">Tengesa4Profit</h1>
      </header>
      
      <LanguageToggle />
      
      <main>
        <Tabs defaultValue="addProduct" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6 grid grid-cols-3">
            <TabsTrigger value="addProduct" className="text-base">
              {t.addProduct}
            </TabsTrigger>
            <TabsTrigger value="tallyProfit" className="text-base">
              {t.tallyProfit}
            </TabsTrigger>
            <TabsTrigger value="language" className="text-base">
              {t.language}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="addProduct">
            {addProductContent}
          </TabsContent>
          
          <TabsContent value="tallyProfit">
            {tallyProfitContent}
          </TabsContent>
          
          <TabsContent value="language">
            {languageSettingsContent}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AppLayout;
