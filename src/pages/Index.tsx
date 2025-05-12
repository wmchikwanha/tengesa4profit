
import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import AppLayout from '@/components/AppLayout';
import ProductForm from '@/components/ProductForm';
import TallyProfit from '@/components/TallyProfit';
import LanguageSettings from '@/components/LanguageSettings';

const Index = () => {
  return (
    <LanguageProvider>
      <AppDataProvider>
        <AppLayout
          addProductContent={<ProductForm />}
          tallyProfitContent={<TallyProfit />}
          languageSettingsContent={<LanguageSettings />}
        />
      </AppDataProvider>
    </LanguageProvider>
  );
};

export default Index;
