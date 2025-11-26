
import React from "react"
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { MarketplaceProvider } from '@/contexts/MarketplaceContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <AppDataProvider>
              <MarketplaceProvider>
                <NotificationProvider>
                  <TooltipProvider>
                    <ToastProvider>
                      <OfflineIndicator />
                      <PWAInstallPrompt />
                      <Routes>
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/" element={<Index />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <Toaster />
                    </ToastProvider>
                  </TooltipProvider>
                </NotificationProvider>
              </MarketplaceProvider>
            </AppDataProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  </QueryClientProvider>
);

export default App;
