import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteAccountRequest {
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId }: DeleteAccountRequest = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Deleting account for user:', userId);

    // Delete from subscribers table (cascades to related data)
    const { error: subscribersError } = await supabaseClient
      .from('subscribers')
      .delete()
      .eq('user_id', userId);

    if (subscribersError) {
      console.error('Error deleting subscriber data:', subscribersError);
    }

    // Delete the auth user (this is the main deletion)
    const { error: authError } = await supabaseClient.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      throw authError;
    }

    console.log('Account deleted successfully for user:', userId);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account deleted successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error deleting account:', error);
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
