import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackRequest {
  feedback: string;
  userEmail: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedback, userEmail }: FeedbackRequest = await req.json();

    console.log('Feedback received:', {
      userEmail,
      feedback: feedback.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });

    // In a production environment, you would:
    // 1. Store feedback in a database table
    // 2. Send an email notification to support team
    // 3. Integrate with a ticketing system
    
    // For now, we'll just log it successfully
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Feedback received successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing feedback:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
