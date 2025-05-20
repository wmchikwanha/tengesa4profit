
import React from 'react';
import AppLayout from '@/components/AppLayout';
import ProductForm from '@/components/ProductForm';
import TallyProfit from '@/components/TallyProfit';
import LanguageSettings from '@/components/LanguageSettings';

const Index = () => {
  return (
    <AppLayout
      addProductContent={<ProductForm />}
      tallyProfitContent={<TallyProfit />}
      languageSettingsContent={<LanguageSettings />}
    />
  );
};

export default Index;
