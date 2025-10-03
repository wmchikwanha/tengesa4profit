
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if subscriber record exists, create if not
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .single();

    if (!existingSubscriber) {
      // Create new subscriber with 1-day trial for testing
      const trialStart = new Date();
      const trialEnd = new Date(trialStart.getTime() + 1 * 24 * 60 * 60 * 1000);
      
      const { error: insertError } = await supabaseClient.from("subscribers").insert({
        email: user.email,
        user_id: user.id,
        subscribed: false,
        subscription_tier: 'trial',
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
      });

      if (insertError) {
        logStep("Error creating subscriber", { error: insertError.message });
        // If insert fails, try to fetch existing record (race condition)
        const { data: existingAfterError } = await supabaseClient
          .from("subscribers")
          .select("*")
          .eq("email", user.email)
          .single();
        
        if (existingAfterError) {
          logStep("Found existing subscriber after insert error");
          return new Response(JSON.stringify({
            subscribed: existingAfterError.subscribed || false,
            subscription_tier: existingAfterError.subscription_tier || 'trial',
            trial_end: existingAfterError.trial_end,
            subscription_end: existingAfterError.subscription_end
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          throw new Error(`Failed to create subscriber: ${insertError.message}`);
        }
      }

      logStep("Created new subscriber with trial");
      return new Response(JSON.stringify({
        subscribed: false,
        subscription_tier: 'trial',
        trial_end: trialEnd.toISOString(),
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      // Check if trial has expired to determine tier
      const now = new Date();
      const trialEnd = existingSubscriber.trial_end ? new Date(existingSubscriber.trial_end) : null;
      let tier = existingSubscriber.subscription_tier;
      
      if (trialEnd && now > trialEnd) {
        tier = "free";
        logStep("No customer found, trial expired, setting to free tier");
        
        // Update database to reflect free tier
        await supabaseClient.from("subscribers").update({
          subscription_tier: "free",
          subscribed: false,
          updated_at: new Date().toISOString(),
        }).eq("email", user.email);
      } else {
        logStep("No customer found, returning trial status");
      }
      
      return new Response(JSON.stringify({
        subscribed: false,
        subscription_tier: tier,
        trial_end: existingSubscriber.trial_end,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = existingSubscriber.subscription_tier;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // With simplified tiers, any paid subscription is 'premium'
      subscriptionTier = "premium";
      logStep("Determined subscription tier", { subscriptionTier });
    } else {
      // Check if trial has expired to determine if user should be on free tier
      const now = new Date();
      const trialEnd = existingSubscriber.trial_end ? new Date(existingSubscriber.trial_end) : null;
      
      if (trialEnd && now > trialEnd) {
        subscriptionTier = "free";
        logStep("Trial expired, setting to free tier");
      } else {
        subscriptionTier = existingSubscriber.subscription_tier || "trial";
        logStep("No active subscription, maintaining current tier", { subscriptionTier });
      }
    }

    await supabaseClient.from("subscribers").update({
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }).eq("email", user.email);

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      trial_end: existingSubscriber.trial_end,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
