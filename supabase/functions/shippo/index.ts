import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SHIPPO_BASE = 'https://api.goshippo.com'

const shippoFetch = async (path: string, options: RequestInit = {}) => {
  const apiKey = Deno.env.get('SHIPPO_API_KEY') || ''
  const res = await fetch(`${SHIPPO_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `ShippoToken ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || JSON.stringify(data))
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify admin via JWT
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Utilizador inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check admin role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, orderId, rateId, parcel } = await req.json()

    // Store's sender address from env
    const addressFrom = {
      name: Deno.env.get('STORE_NAME') || 'Tralalá Criativo',
      street1: Deno.env.get('STORE_STREET') || '',
      city: Deno.env.get('STORE_CITY') || '',
      zip: Deno.env.get('STORE_ZIP') || '',
      country: 'PT',
      phone: Deno.env.get('STORE_PHONE') || '',
      email: Deno.env.get('STORE_EMAIL') || '',
    }

    if (action === 'get_rates') {
      // Fetch order shipping address
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('shipping_address')
        .eq('id', orderId)
        .single()

      if (orderError || !order?.shipping_address) {
        return new Response(JSON.stringify({ error: 'Endereço de envio não disponível' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const addr = order.shipping_address
      const addressTo = {
        name: addr.name || '',
        street1: addr.line1 || '',
        street2: addr.line2 || '',
        city: addr.city || '',
        zip: addr.postal_code || '',
        country: addr.country || 'PT',
      }

      const defaultParcel = parcel || {
        length: '20',
        width: '15',
        height: '10',
        distance_unit: 'cm',
        weight: '0.5',
        mass_unit: 'kg',
      }

      const shipment = await shippoFetch('/shipments/', {
        method: 'POST',
        body: JSON.stringify({
          address_from: addressFrom,
          address_to: addressTo,
          parcels: [defaultParcel],
          async: false,
        }),
      })

      return new Response(JSON.stringify({ shipment }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'buy_label') {
      if (!rateId) {
        return new Response(JSON.stringify({ error: 'rateId é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const transaction = await shippoFetch('/transactions/', {
        method: 'POST',
        body: JSON.stringify({
          rate: rateId,
          label_file_type: 'PDF',
          async: false,
        }),
      })

      if (transaction.status !== 'SUCCESS') {
        throw new Error(transaction.messages?.[0]?.text || 'Erro ao comprar etiqueta')
      }

      // Save tracking info to order
      await supabaseAdmin
        .from('orders')
        .update({
          tracking_code: transaction.tracking_number,
          tracking_url: transaction.tracking_url_provider,
          shippo_transaction_id: transaction.object_id,
          label_url: transaction.label_url,
          status: 'enviado',
        })
        .eq('id', orderId)

      return new Response(JSON.stringify({ transaction }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'track') {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('tracking_code, shippo_transaction_id')
        .eq('id', orderId)
        .single()

      if (orderError || !order?.tracking_code) {
        return new Response(JSON.stringify({ error: 'Sem código de rastreio' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Use Shippo tracking endpoint — carrier 'correios' for CTT Portugal
      const carrier = 'correios'
      const tracking = await shippoFetch(`/tracks/${carrier}/${order.tracking_code}`)

      return new Response(JSON.stringify({ tracking }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
