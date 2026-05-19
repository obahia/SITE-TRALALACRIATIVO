import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Create Supabase client with service_role for server-side operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Extract auth token to identify user
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify user via their JWT
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

    const { cartItems, successUrl, cancelUrl } = await req.json()

    if (!cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: 'Carrinho vazio' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate input shape
    for (const item of cartItems) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return new Response(JSON.stringify({ error: 'Item inválido: product_id e quantity são obrigatórios' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // SERVER-SIDE: Fetch real prices from database
    const productIds = cartItems.map((item: { product_id: string }) => item.product_id)
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, image_url, is_active')
      .in('id', productIds)

    if (productsError || !products) {
      return new Response(JSON.stringify({ error: 'Erro ao buscar produtos' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate all products exist and are active
    const productMap = new Map(products.map((p: { id: string }) => [p.id, p]))
    for (const item of cartItems) {
      const product = productMap.get(item.product_id)
      if (!product) {
        return new Response(JSON.stringify({ error: `Produto não encontrado: ${item.product_id}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (!product.is_active) {
        return new Response(JSON.stringify({ error: `Produto indisponível: ${product.name}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Calculate total using SERVER prices
    const orderItemsData = cartItems.map((item: { product_id: string; quantity: number; customization?: Record<string, unknown> }) => {
      const product = productMap.get(item.product_id)!
      return {
        product_id: item.product_id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        customization: item.customization || null,
      }
    })

    const totalAmount = orderItemsData.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )

    // Create Stripe session FIRST (no orphan order if this fails)
    const line_items = orderItemsData.map((item: { name: string; price: number; quantity: number }) => {
      const product = productMap.get(cartItems.find((ci: { product_id: string }) => ci.product_id === item.product_id)?.product_id || '')
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            ...(product?.image_url ? { images: [product.image_url] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }
    })

    // Create order in DB with status 'pendente'
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'pendente',
      })
      .select()
      .single()

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Erro ao criar pedido' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Insert order items
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData.map((item: { product_id: string; name: string; price: number; quantity: number; customization: Record<string, unknown> | null }) => ({
        ...item,
        order_id: order.id,
      })))

    if (itemsError) {
      // Cleanup: delete the order if items fail
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return new Response(JSON.stringify({ error: 'Erro ao criar itens do pedido' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Append orderId to success URL so the frontend can poll order status
    const separator = (successUrl || '').includes('?') ? '&' : '?'
    const finalSuccessUrl = `${successUrl || 'https://example.com/sucesso'}${separator}orderId=${order.id}`

    // Create Stripe checkout session (Payment Element compatible)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      ui_mode: 'embedded',
      line_items,
      mode: 'payment',
      locale: 'pt',
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        orderId: String(order.id),
        userId: user.id,
      },
      redirect_on_completion: 'never',
    })

    return new Response(JSON.stringify({
      clientSecret: session.client_secret,
      orderId: order.id,
      sessionId: session.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno do servidor'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
