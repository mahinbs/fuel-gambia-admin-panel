// Edge Function: validate-qr
// Deployed to: Supabase > Edge Functions > validate-qr
// 
// This function validates a QR coupon payload and redeems it atomically.
// It calls the validate_and_redeem_coupon RPC under the service role key
// to bypass RLS for the atomic write operation.
//
// Deploy: supabase functions deploy validate-qr
// Invoke URL: https://<project>.supabase.co/functions/v1/validate-qr

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Validate JWT from the incoming request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { qr_payload, station_id, liters } = body;

    if (!qr_payload || !station_id || !liters) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call atomic RPC
    const { data, error } = await supabase.rpc('validate_and_redeem_coupon', {
      p_qr_payload: qr_payload,
      p_station_id: station_id,
      p_attendant_id: user.id,
      p_liters: liters,
    });

    if (error) throw error;

    // Create notification for beneficiary if successful
    if (data?.success && data?.transaction_id) {
      // Get coupon to find beneficiary
      const { data: coupon } = await supabase
        .from('coupons')
        .select('beneficiary_id, fuel_type, liters')
        .eq('qr_payload', qr_payload)
        .single();

      if (coupon) {
        await supabase.from('notifications').insert({
          user_id: coupon.beneficiary_id,
          type: 'TRANSACTION_SUCCESS',
          title: 'Fuel Redeemed',
          message: `Your coupon for ${liters}L of ${coupon.fuel_type} has been successfully redeemed.`,
          data: { transaction_id: data.transaction_id },
        });
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
