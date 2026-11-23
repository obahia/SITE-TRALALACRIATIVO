import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ---------------------------------------------------------------------------
// Envio (manter igual a SHIPPING em src/data/occasions.js)
// ---------------------------------------------------------------------------
function envNumber(name: string, fallback: number): number {
  const raw = Deno.env.get(name)
  if (raw === undefined || raw.trim() === '') return fallback
  const value = Number(raw.replace(',', '.'))
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

const SHIPPING_CTT_PRICE = envNumber('SHIPPING_CTT_PRICE', 4.9) // € CTT Expresso (Portugal)
const SHIPPING_FREE_FROM = envNumber('SHIPPING_FREE_FROM', 60) // € subtotal de produtos para portes grátis
const MAX_QUANTITY = 1000
const MAX_CART_ITEMS = 100

// ---------------------------------------------------------------------------
// URLs permitidas (successUrl e imagens relativas)
// ---------------------------------------------------------------------------
const DEFAULT_SUCCESS_URL = 'https://tralalacriativo.pt/sucesso'

function httpsOrigin(value: string | undefined | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.origin : null
  } catch {
    return null
  }
}

const ALLOWED_ORIGINS = new Set(
  [Deno.env.get('SITE_URL'), 'https://tralalacriativo.pt', 'https://www.tralalacriativo.pt']
    .map((value) => httpsOrigin(value))
    .filter((value): value is string => value !== null),
)

type CustomizationOption = {
  label?: unknown
  price?: unknown
  allows_text?: unknown
  allows_image?: unknown
}

type ProductRow = {
  id: number | string
  name: string
  price: number | string
  image_url: string | null
  is_active: boolean
  min_quantity: number | null
  sale_mode: string | null
  customization_options: CustomizationOption[] | null
}

type CartItem = {
  product_id: number | string
  quantity: number
  customization?: Record<string, unknown> | null
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Preço unitário do servidor: preço da opção escolhida, se existir; senão preço base.
// Se o produto tiver opções com preços diferentes, a opção é obrigatória (devolve null).
function resolveUnitPrice(product: ProductRow, customization: CartItem['customization']): number | null {
  const options = Array.isArray(product.customization_options) ? product.customization_options : []
  const chosenLabel = customization?.personalizationType
  if (typeof chosenLabel === 'string') {
    const option = options.find((opt) => opt?.label === chosenLabel)
    const optionPrice = Number(option?.price)
    if (option && Number.isFinite(optionPrice)) return optionPrice
  }
  const distinctPrices = new Set(options.map((opt) => Number(opt?.price)))
  if (distinctPrices.size > 1) return null
  return Number(product.price)
}

// Guarda só os campos de personalização conhecidos, com tamanho limitado.
function sanitizeCustomization(raw: CartItem['customization']): Record<string, string> | null {
  if (!raw || typeof raw !== 'object') return null
  const out: Record<string, string> = {}
  const text = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : '')
  const type = text(raw.personalizationType, 100)
  const instructions = text(raw.instructions, 2000)
  const image = text(raw.uploadedImage, 600)
  if (type) out.personalizationType = type
  if (instructions) out.instructions = instructions
  if (image && httpsOrigin(image)) out.uploadedImage = image
  return Object.keys(out).length ? out : null
}

function resolveImageUrl(imageUrl: string | null, siteOrigin: string | null): string | null {
  if (!imageUrl) return null
  if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
    return siteOrigin ? `${siteOrigin}${imageUrl}` : null
  }
  return httpsOrigin(imageUrl) ? imageUrl : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create Supabase client with service_role for server-side operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Extract auth token to identify user
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Não autenticado' }, 401)
    }

    // Verify user via their JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return jsonResponse({ error: 'Utilizador inválido' }, 401)
    }

    const { cartItems, successUrl } = await req.json()

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return jsonResponse({ error: 'Carrinho vazio' }, 400)
    }
    if (cartItems.length > MAX_CART_ITEMS) {
      return jsonResponse({ error: 'Demasiados itens no carrinho' }, 400)
    }

    // Validate input shape
    for (const item of cartItems as CartItem[]) {
      const idType = typeof item?.product_id
      if (!item || (idType !== 'string' && idType !== 'number') || item.product_id === '' || !Number.isInteger(item.quantity)) {
        return jsonResponse({ error: 'Item inválido: product_id e quantity são obrigatórios' }, 400)
      }
    }

    // successUrl só é aceite se a origem for https e estiver na allowlist.
    // Com redirect_on_completion 'never' o Stripe não usa return_url; a origem
    // validada serve para tornar absolutas as imagens relativas dos produtos.
    const requestedOrigin = typeof successUrl === 'string' ? httpsOrigin(successUrl) : null
    const siteOrigin = requestedOrigin && ALLOWED_ORIGINS.has(requestedOrigin) ? requestedOrigin : null
    const safeSuccessUrl = siteOrigin ? successUrl as string : DEFAULT_SUCCESS_URL

    // SERVER-SIDE: Fetch real prices from database
    const productIds = [...new Set((cartItems as CartItem[]).map((item) => String(item.product_id)))]
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, image_url, is_active, min_quantity, sale_mode, customization_options')
      .in('id', productIds)

    if (productsError || !products) {
      return jsonResponse({ error: 'Erro ao buscar produtos' }, 500)
    }

    // Validate products, quantities and prices
    const productMap = new Map((products as ProductRow[]).map((p) => [String(p.id), p]))
    const orderItemsData: {
      product_id: number | string
      name: string
      price: number
      quantity: number
      customization: Record<string, string> | null
    }[] = []

    for (const item of cartItems as CartItem[]) {
      const product = productMap.get(String(item.product_id))
      if (!product) {
        return jsonResponse({ error: `Produto não encontrado: ${item.product_id}` }, 400)
      }
      if (!product.is_active) {
        return jsonResponse({ error: `Produto indisponível: ${product.name}` }, 400)
      }
      if (product.sale_mode === 'quote') {
        return jsonResponse({ error: `${product.name} é vendido sob orçamento. Peça um orçamento para este produto.` }, 400)
      }

      const minQuantity = Math.max(1, Number(product.min_quantity) || 1)
      if (item.quantity < minQuantity || item.quantity > MAX_QUANTITY) {
        return jsonResponse({
          error: `Quantidade inválida para ${product.name}: mínimo ${minQuantity} e máximo ${MAX_QUANTITY} unidades.`,
        }, 400)
      }

      const unitPrice = resolveUnitPrice(product, item.customization)
      if (unitPrice === null) {
        return jsonResponse({ error: `Escolha uma opção para ${product.name} antes de pagar.` }, 400)
      }
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return jsonResponse({ error: `Preço inválido para ${product.name}` }, 400)
      }

      orderItemsData.push({
        product_id: product.id,
        name: product.name,
        price: Math.round(unitPrice * 100) / 100,
        quantity: item.quantity,
        customization: sanitizeCustomization(item.customization),
      })
    }

    // Subtotal dos produtos em cêntimos (evita erros de vírgula flutuante)
    const subtotalCents = orderItemsData.reduce(
      (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
      0
    )
    const totalAmount = subtotalCents / 100

    const line_items = orderItemsData.map((item) => {
      const product = productMap.get(String(item.product_id))
      const image = resolveImageUrl(product?.image_url ?? null, siteOrigin)
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            ...(image ? { images: [image] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }
    })

    // Envio: CTT Expresso (grátis acima do limite) ou levantamento em Leiria
    const freeShipping = subtotalCents >= Math.round(SHIPPING_FREE_FROM * 100)
    const shipping_options: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: freeShipping ? 'CTT Expresso (portes grátis)' : 'CTT Expresso',
          fixed_amount: {
            amount: freeShipping ? 0 : Math.round(SHIPPING_CTT_PRICE * 100),
            currency: 'eur',
          },
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 2 },
            maximum: { unit: 'business_day', value: 4 },
          },
          metadata: { method: 'ctt' },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: 'Levantamento em Leiria (grátis)',
          fixed_amount: { amount: 0, currency: 'eur' },
          metadata: { method: 'levantamento' },
        },
      },
    ]

    // Create order in DB with status 'pendente' (total = subtotal; o webhook atualiza com portes)
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
      return jsonResponse({ error: 'Erro ao criar pedido' }, 500)
    }

    const deleteOrder = async () => {
      await supabaseAdmin.from('order_items').delete().eq('order_id', order.id)
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
    }

    // Insert order items
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData.map((item) => ({
        ...item,
        order_id: order.id,
      })))

    if (itemsError) {
      // Cleanup: delete the order if items fail
      await deleteOrder()
      return jsonResponse({ error: 'Erro ao criar itens do pedido' }, 500)
    }

    // Create Stripe checkout session (embedded). Se falhar, apaga o pedido para não ficar órfão.
    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        ui_mode: 'embedded',
        line_items,
        mode: 'payment',
        locale: 'pt',
        client_reference_id: user.id,
        customer_email: user.email,
        shipping_address_collection: { allowed_countries: ['PT'] },
        shipping_options,
        phone_number_collection: { enabled: true },
        metadata: {
          orderId: String(order.id),
          userId: user.id,
        },
        redirect_on_completion: 'never',
      })
    } catch (stripeError) {
      await deleteOrder()
      console.error('Erro ao criar sessão Stripe:', stripeError)
      return jsonResponse({ error: 'Erro ao iniciar o pagamento' }, 502)
    }

    // successUrl validado + orderId, para o frontend poder fazer polling do estado
    const separator = safeSuccessUrl.includes('?') ? '&' : '?'
    const finalSuccessUrl = `${safeSuccessUrl}${separator}orderId=${encodeURIComponent(String(order.id))}`

    return jsonResponse({
      clientSecret: session.client_secret,
      orderId: order.id,
      sessionId: session.id,
      successUrl: finalSuccessUrl,
    }, 200)
  } catch (err) {
    console.error('create-checkout-session:', err)
    return jsonResponse({ error: 'Erro interno do servidor' }, 500)
  }
})
