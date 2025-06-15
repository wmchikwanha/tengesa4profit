
import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/hooks/toast/toast-context";
import { ToastProvider as RadixToastProvider } from "@/components/ui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create the query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CurrencyProvider>
        <AppDataProvider>
          <ToastProvider>
            <RadixToastProvider>
              <TooltipProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </TooltipProvider>
            </RadixToastProvider>
          </ToastProvider>
        </AppDataProvider>
      </CurrencyProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
