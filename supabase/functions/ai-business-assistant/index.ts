import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, conversationHistory = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context summary from business data
    const contextSummary = buildContextSummary(context);

    // Prepare messages with system prompt
    const messages = [
      {
        role: "system",
        content: `You are a friendly business advisor for street traders in Zimbabwe. Your role is to:

1. Answer questions about their business data (products, sales, profits, inventory)
2. Provide actionable insights and advice
3. Be conversational, warm, and encouraging
4. Use simple language - avoid jargon
5. When showing numbers, always format with proper currency symbols (${context.currency || 'USD'})
6. Highlight opportunities (low stock, high-margin products, slow movers)
7. Celebrate wins (good profit days, successful products)
8. Keep responses concise - use bullet points for clarity

Current Business Context:
${contextSummary}

Answer in a friendly, conversational way. Be specific with numbers. Use emojis occasionally for warmth.`
      },
      ...conversationHistory.slice(-6), // Last 6 messages for context
      {
        role: "user",
        content: message
      }
    ];

    console.log("Calling AI with context:", { messageCount: messages.length });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limit", message: "AI is busy right now. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "payment_required", message: "AI credits depleted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Stream the response back to client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in ai-business-assistant:", error);
    return new Response(
      JSON.stringify({ error: "internal_error", message: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildContextSummary(context: any): string {
  const parts: string[] = [];
  
  // Products summary
  if (context.products && context.products.length > 0) {
    parts.push(`PRODUCTS (${context.products.length} total):`);
    context.products.slice(0, 10).forEach((p: any) => {
      const stockLeft = p.quantityBought - p.quantitySold - p.quantityDiscarded;
      parts.push(`- ${p.name}: Bought ${p.quantityBought}, Sold ${p.quantitySold}, Stock remaining: ${stockLeft}, Profit/unit: ${context.currencySymbol}${p.profitPerUnit?.toFixed(2) || '0.00'}`);
    });
    if (context.products.length > 10) {
      parts.push(`... and ${context.products.length - 10} more products`);
    }
  } else {
    parts.push("No products tracked yet.");
  }
  
  // Today's performance
  if (context.todaysSales) {
    parts.push(`\nTODAY'S PERFORMANCE:`);
    parts.push(`- Total Profit: ${context.currencySymbol}${context.todaysSales.totalProfit?.toFixed(2) || '0.00'}`);
    parts.push(`- Total Sales Value: ${context.currencySymbol}${context.todaysSales.totalSales?.toFixed(2) || '0.00'}`);
    parts.push(`- Items Sold Today: ${context.todaysSales.itemsSold || 0}`);
  }
  
  // Stock alerts
  if (context.alerts && context.alerts.length > 0) {
    parts.push(`\nALERTS:`);
    context.alerts.forEach((alert: string) => parts.push(`- ${alert}`));
  }
  
  // Currency settings
  parts.push(`\nCURRENCY: ${context.currency || 'USD'} (Exchange rate: ${context.exchangeRate || 1})`);
  
  return parts.join('\n');
}
