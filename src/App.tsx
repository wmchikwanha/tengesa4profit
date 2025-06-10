
import * as React from "react"
import { ToasterWithProvider } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "@/hooks/use-toast";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create the query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToasterWithProvider />
        <Sonner />
      </TooltipProvider>
    </ToastProvider>
  </QueryClientProvider>
);

export default App;
