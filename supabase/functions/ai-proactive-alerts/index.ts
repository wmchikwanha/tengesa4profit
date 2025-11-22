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
    const { context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build analysis prompt
    const analysisPrompt = buildAnalysisPrompt(context);

    console.log("Generating proactive insights...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a business advisor for street traders. Analyze their business data and provide 2-4 actionable alerts.

Each alert should be:
- Specific and actionable
- Based on actual data
- Prioritized by urgency/impact
- Brief (1-2 sentences max)

Format your response as a JSON array of alert objects:
[
  {
    "type": "warning" | "info" | "success",
    "title": "Brief title (5-8 words)",
    "message": "Actionable message (1-2 sentences)",
    "priority": "high" | "medium" | "low"
  }
]

Focus on:
- Low stock alerts (≤5 items remaining)
- High-profit opportunities (best sellers to restock)
- Low margin products (need price adjustment)
- Slow-moving inventory
- Daily performance highlights`
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Extract JSON from response (handle markdown code blocks)
    let alerts;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      alerts = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      alerts = [];
    }

    console.log("Generated alerts:", alerts);

    return new Response(
      JSON.stringify({ alerts, timestamp: new Date().toISOString() }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in ai-proactive-alerts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildAnalysisPrompt(context: any): string {
  const parts: string[] = [];
  
  parts.push(`Business Data Analysis:`);
  parts.push(`Currency: ${context.currency} (Rate: ${context.exchangeRate})`);
  parts.push('');
  
  // Products analysis
  if (context.products && context.products.length > 0) {
    parts.push(`PRODUCTS (${context.products.length} total):`);
    
    const lowStock = context.products.filter((p: any) => p.stockRemaining > 0 && p.stockRemaining <= 5);
    const highProfit = context.products
      .filter((p: any) => p.quantitySold > 0)
      .sort((a: any, b: any) => (b.profitPerUnit * b.quantitySold) - (a.profitPerUnit * a.quantitySold))
      .slice(0, 3);
    const lowMargin = context.products.filter((p: any) => {
      const margin = (p.profitPerUnit / p.sellingPrice) * 100;
      return margin < 5 && margin > 0;
    });
    const slowMoving = context.products.filter((p: any) => p.stockRemaining > 10 && p.quantitySold === 0);
    
    if (lowStock.length > 0) {
      parts.push(`\nLOW STOCK (${lowStock.length}):`);
      lowStock.forEach((p: any) => {
        parts.push(`- ${p.name}: ${p.stockRemaining} remaining, ${p.quantitySold} sold`);
      });
    }
    
    if (highProfit.length > 0) {
      parts.push(`\nBEST PERFORMERS (Top 3):`);
      highProfit.forEach((p: any) => {
        const totalProfit = p.profitPerUnit * p.quantitySold;
        parts.push(`- ${p.name}: ${context.currencySymbol}${totalProfit.toFixed(2)} profit, ${p.quantitySold} sold, ${p.stockRemaining} remaining`);
      });
    }
    
    if (lowMargin.length > 0) {
      parts.push(`\nLOW MARGIN PRODUCTS (${lowMargin.length}):`);
      lowMargin.forEach((p: any) => {
        const margin = ((p.profitPerUnit / p.sellingPrice) * 100).toFixed(1);
        parts.push(`- ${p.name}: ${margin}% margin`);
      });
    }
    
    if (slowMoving.length > 0) {
      parts.push(`\nSLOW MOVING (${slowMoving.length}):`);
      slowMoving.slice(0, 3).forEach((p: any) => {
        parts.push(`- ${p.name}: ${p.stockRemaining} in stock, no sales yet`);
      });
    }
  }
  
  // Today's performance
  if (context.todaysSales) {
    parts.push(`\nTODAY'S PERFORMANCE:`);
    parts.push(`- Total Profit: ${context.currencySymbol}${context.todaysSales.totalProfit?.toFixed(2) || '0.00'}`);
    parts.push(`- Items Sold: ${context.todaysSales.itemsSold || 0}`);
    parts.push(`- Total Sales: ${context.currencySymbol}${context.todaysSales.totalSales?.toFixed(2) || '0.00'}`);
  }
  
  return parts.join('\n');
}
