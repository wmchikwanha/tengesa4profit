
import React, { ReactNode, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AppLayoutProps {
  children?: ReactNode;
  addProductContent: ReactNode;
  tallyProfitContent: ReactNode;
  languageSettingsContent: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  addProductContent,
  tallyProfitContent,
  languageSettingsContent,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('addProduct');

  return (
    <div className="trader-container min-h-screen">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-trader-primary">{t.appTitle}</h1>
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
