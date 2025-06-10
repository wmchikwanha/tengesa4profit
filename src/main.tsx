
import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { ToastProvider } from '@/hooks/toast/toast-context';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CurrencyProvider>
          <AppDataProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AppDataProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
