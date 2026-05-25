// Edge Function: monthly-reconciliation
// Deployed to: Supabase > Edge Functions > monthly-reconciliation
//
// Triggers the monthly balancing calculation for a station.
// Computes fuel ordered vs sold vs physical closing stock.
// Determines shortage and whether it is payable per policy.
//
// Deploy: supabase functions deploy monthly-reconciliation

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

    const { station_id, period_month, period_year, fuel_type, closing_stock_physical } = await req.json();

    if (!station_id || !period_month || !period_year || !fuel_type || closing_stock_physical === undefined) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase.rpc('calculate_reconciliation', {
      p_station_id: station_id,
      p_period_month: period_month,
      p_period_year: period_year,
      p_fuel_type: fuel_type,
      p_closing_stock_physical: closing_stock_physical,
      p_reconciled_by: user.id,
    });

    if (error) throw error;

    // Notify HQ if shortage is payable
    if (data?.shortage_payable) {
      const { data: station } = await supabase.from('stations').select('hq_id, name').eq('id', station_id).single();
      if (station?.hq_id) {
        await supabase.from('notifications').insert({
          user_id: station.hq_id,
          type: 'RECONCILIATION_DUE',
          title: 'Payable Shortage Detected',
          message: `Station ${station.name} has a payable ${fuel_type} shortage of ${data.shortage?.toFixed(2)}L for ${period_month}/${period_year}.`,
          data: { reconciliation_id: data.reconciliation_id, station_id },
        });
      }
    }

    return new Response(JSON.stringify({ success: true, ...data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
