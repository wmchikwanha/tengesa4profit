import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Sparkles, Send, X, Loader2 } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { calculateProduct } from '@/lib/types';
import { useAnalytics } from '@/hooks/useAnalytics';

import { buildDailyClosing, buildRestockForecast, buildHealthWatchdog, buildNegotiationCoach, AgentBuild } from '@/lib/agents';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  transparency?: Record<string, unknown>;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products, salesHistory } = useAppData();
  const { formatPrice, getCurrencySymbol, settings } = useCurrency();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [negProduct, setNegProduct] = useState('');
  const [negOffer, setNegOffer] = useState('');
  const [expandedTransparency, setExpandedTransparency] = useState<Record<number, boolean>>({});
  const [pendingTransparency, setPendingTransparency] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('ai_assistant_visited');
    if (hasVisited) {
      setIsFirstVisit(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isFirstVisit) {
      localStorage.setItem('ai_assistant_visited', 'true');
      setIsFirstVisit(false);
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: `👋 Hi! I'm your AI business assistant.\n\nI can help you with:\n• Profit summaries and insights\n• Stock level checks\n• Product performance analysis\n• Business advice\n\nWhat would you like to know?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, isFirstVisit]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildBusinessContext = () => {
    // Calculate today's sales
    const today = new Date().toISOString().split('T')[0];
    const todaySales = salesHistory.filter(s => s.date === today);
    const todayProfit = todaySales.reduce((sum, s) => sum + s.totalProfit, 0);
    const todayItemsSold = todaySales.reduce((sum, s) => sum + s.products.length, 0);

    // Calculate total sales value
    const totalSalesValue = products.reduce((sum, p) => {
      const calc = calculateProduct(p);
      return sum + (p.quantitySold * calc.sellingPrice);
    }, 0);

    // Prepare products with calculations
    const productsWithCalc = products.map(p => {
      const calc = calculateProduct(p);
      return {
        ...p,
        profitPerUnit: calc.profitPerUnit,
        stockRemaining: calc.stockRemaining,
      };
    });

    // Generate alerts
    const alerts: string[] = [];
    productsWithCalc.forEach(p => {
      if (p.stockRemaining <= 5 && p.stockRemaining > 0) {
        alerts.push(`⚠️ Low stock: ${p.name} (${p.stockRemaining} remaining)`);
      }
      const calc = calculateProduct(p);
      if (calc.lowMargin) {
        alerts.push(`💰 Low margin: ${p.name} (less than 5%)`);
      }
    });

    return {
      products: productsWithCalc,
      todaysSales: {
        totalProfit: todayProfit,
        totalSales: totalSalesValue,
        itemsSold: todayItemsSold,
      },
      alerts,
      currency: settings.currentCurrency,
      exchangeRate: settings.exchangeRate,
      currencySymbol: getCurrencySymbol(),
    };
  };

  const sendMessage = async (text: string, transparency?: Record<string, unknown>) => {
    if (!text.trim() || isLoading) return;

    trackEvent('ai_assistant_used', { messageLength: text.length });

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
      transparency,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = buildBusinessContext();
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(
        `https://wtvglsneskjzhfudqpgv.supabase.co/functions/v1/ai-business-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: text,
            context,
            conversationHistory
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          toast({
            title: "AI is busy",
            description: "Please try again in a moment.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        if (response.status === 402) {
          toast({
            title: "AI Credits Depleted",
            description: "Please contact support to top up.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        throw new Error(error.message || 'Failed to get AI response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || line.startsWith(':')) continue;
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'assistant') {
                    return prev.map((m, i) => 
                      i === prev.length - 1 
                        ? { ...m, content: assistantMessage }
                        : m
                    );
                  }
                  return [...prev, {
                    role: 'assistant',
                    content: assistantMessage,
                    timestamp: new Date()
                  }];
                });
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

    } catch (error) {
      console.error('AI Assistant error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    "Show profit summary",
    "How much stock do I have?",
    "What are my best sellers?",
    "Give me business advice"
  ];

  const runAgent = (build: AgentBuild, agentId: string) => {
    trackEvent('agent_used', { agent: agentId });
    sendMessage(build.prompt, build.transparency);
  };

  const runNegotiation = () => {
    if (!negProduct.trim() || !negOffer.trim()) return;
    const build = buildNegotiationCoach(negProduct, Number(negOffer), language);
    trackEvent('agent_used', { agent: 'negotiation_coach' });
    setNegotiateOpen(false);
    setNegProduct('');
    setNegOffer('');
    sendMessage(build.prompt, build.transparency);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-4 right-4 z-50 rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 ai-pulse hover:animate-none flex flex-col items-center justify-center gap-0.5"
          aria-label="AI Business Assistant"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-[10px] font-semibold">AI</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Business Assistant
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {msg.transparency && (
                    <div className="mt-2 border-t border-primary-foreground/20 pt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedTransparency(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className="text-[11px] opacity-80 underline"
                      >
                        🔍 {expandedTransparency[idx] ? 'Hide' : 'What was sent?'}
                      </button>
                      {expandedTransparency[idx] && (
                        <pre className="mt-1 text-[10px] whitespace-pre-wrap opacity-90 max-h-48 overflow-auto">
                          {JSON.stringify(msg.transparency, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {messages.length === 0 && !isLoading && (
            <div className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground">Try asking:</p>
              {quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => sendMessage(action)}
                >
                  {action}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="px-4 py-2 border-t bg-muted/30">
          <p className="text-[11px] font-semibold text-muted-foreground mb-2">⚡ Quick Agents</p>
          <div className="grid grid-cols-2 gap-1.5">
            <Button size="sm" variant="secondary" className="text-xs h-auto py-1.5"
              disabled={isLoading}
              onClick={() => runAgent(buildDailyClosing(products, salesHistory), 'daily_closing')}>
              📊 Close books
            </Button>
            <Button size="sm" variant="secondary" className="text-xs h-auto py-1.5"
              disabled={isLoading}
              onClick={() => runAgent(buildRestockForecast(products, salesHistory), 'restock_forecast')}>
              📦 What to buy?
            </Button>
            <Button size="sm" variant="secondary" className="text-xs h-auto py-1.5"
              disabled={isLoading}
              onClick={() => setNegotiateOpen(true)}>
              💬 Negotiate
            </Button>
            <Button size="sm" variant="secondary" className="text-xs h-auto py-1.5"
              disabled={isLoading}
              onClick={() => runAgent(buildHealthWatchdog(products, salesHistory), 'health_watchdog')}>
              🩺 Health check
            </Button>
          </div>
        </div>

        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>

      <Dialog open={negotiateOpen} onOpenChange={setNegotiateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>💬 Price Negotiation Coach</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>What product?</Label>
              <Input value={negProduct} onChange={(e) => setNegProduct(e.target.value)} placeholder="e.g. Cooking oil 2L" />
            </div>
            <div>
              <Label>Supplier's price per unit ({getCurrencySymbol()})</Label>
              <Input type="number" value={negOffer} onChange={(e) => setNegOffer(e.target.value)} placeholder="e.g. 4.50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNegotiateOpen(false)}>Cancel</Button>
            <Button onClick={runNegotiation} disabled={!negProduct.trim() || !negOffer.trim()}>Get advice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};
};
