
import Toaster from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AppDataProvider } from "./contexts/AppDataContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ToastProvider } from "./hooks/use-toast";

// Create the query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <BrowserRouter>
        <LanguageProvider>
          <AppDataProvider>
            <TooltipProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AppDataProvider>
        </LanguageProvider>
        {/* Place these components outside the other providers but inside ToastProvider */}
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </ToastProvider>
  </QueryClientProvider>
);

export default App;
