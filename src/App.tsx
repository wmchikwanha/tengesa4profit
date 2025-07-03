
import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/hooks/toast/toast-context";
import { ToastProvider as RadixToastProvider } from "@/components/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { MarketplaceProvider } from '@/contexts/MarketplaceContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <ToastProvider>
        <RadixToastProvider>
          <AuthProvider>
            <LanguageProvider>
              <CurrencyProvider>
                <AppDataProvider>
                  <MarketplaceProvider>
                    <TooltipProvider>
                      <Routes>
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/" element={<Index />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <Toaster />
                    </TooltipProvider>
                  </MarketplaceProvider>
                </AppDataProvider>
              </CurrencyProvider>
            </LanguageProvider>
          </AuthProvider>
        </RadixToastProvider>
      </ToastProvider>
    </Router>
  </QueryClientProvider>
);

export default App;
