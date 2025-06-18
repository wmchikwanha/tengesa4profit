
import * as React from 'react';
import AppLayout from '@/components/AppLayout';
import ProductForm from '@/components/ProductForm';
import TallyProfit from '@/components/TallyProfit';
import Marketplace from '@/components/marketplace/Marketplace';

const Index = () => {
  return (
    <AppLayout
      addProductContent={<ProductForm />}
      tallyProfitContent={<TallyProfit />}
      marketplaceContent={<Marketplace />}
    />
  );
};

export default Index;
