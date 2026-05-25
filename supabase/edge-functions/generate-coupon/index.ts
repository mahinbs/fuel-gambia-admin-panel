// Edge Function: generate-coupon
// Deployed to: Supabase > Edge Functions > generate-coupon
//
// Generates a digitally-signed QR coupon for a beneficiary.
// Only callable by GOVERNMENT_ADMIN or SUPER_ADMIN roles.
//
// Deploy: supabase functions deploy generate-coupon

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateSecureQRPayload(beneficiaryId: string, fuelType: string, liters: number): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `FG-${beneficiaryId.slice(0, 8)}-${fuelType[0]}-${liters}-${timestamp}-${random}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await anonClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['SUPER_ADMIN', 'GOVERNMENT_ADMIN'].includes(profile.role)) {
      return new Response(JSON.stringify({ success: false, error: 'Insufficient permissions' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { beneficiary_id, allocation_id, fuel_type, amount, liters, expires_at } = await req.json();

    if (!beneficiary_id || !fuel_type || !amount || !liters || !expires_at) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const qrPayload = generateSecureQRPayload(beneficiary_id, fuel_type, liters);

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        allocation_id: allocation_id || null,
        beneficiary_id,
        fuel_type,
        amount,
        liters,
        qr_payload: qrPayload,
        expires_at,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) throw error;

    // Notify beneficiary
    await supabase.from('notifications').insert({
      user_id: beneficiary_id,
      type: 'COUPON_GENERATED',
      title: 'New Fuel Coupon',
      message: `A fuel coupon for ${liters}L of ${fuel_type} has been generated for you.`,
      data: { coupon_id: coupon.id, qr_payload: qrPayload },
    });

    return new Response(JSON.stringify({ success: true, coupon, qr_payload: qrPayload }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
