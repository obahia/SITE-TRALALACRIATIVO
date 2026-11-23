import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Deno só tem Web Crypto (assíncrono): a verificação da assinatura tem de usar
// constructEventAsync com o SubtleCryptoProvider.
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Códigos postais do distrito de Leiria (manter igual a create-checkout-session)
const LEIRIA_RANGES: [number, number][] = [
  [2400, 2499], [2500, 2529], [2540, 2549], [3100, 3109], [3240, 3289],
]

function zoneOf(postal: string | null | undefined): 'leiria' | 'continente' | 'ilhas' | null {
  const match = postal?.trim().match(/^(\d{4})/)
  if (!match) return null
  const prefix = Number(match[1])
  if (prefix >= 9000) return 'ilhas'
  return LEIRIA_RANGES.some(([from, to]) => prefix >= from && prefix <= to) ? 'leiria' : 'continente'
}

// 'ctt' | 'ctt-leiria' | 'levantamento' (metadata da shipping rate criada no checkout); fallback: display_name
async function resolveShippingMethod(session: Stripe.Checkout.Session): Promise<string | null> {
  const rate = session.shipping_cost?.shipping_rate
  // Levantamento em Leiria não tem shipping rate: vem da metadata da sessão
  if (!rate) return session.metadata?.delivery === 'levantamento' ? 'levantamento' : null
  try {
    const shippingRate = typeof rate === 'string' ? await stripe.shippingRates.retrieve(rate) : rate
    return shippingRate.metadata?.method || shippingRate.display_name || null
  } catch (err) {
    console.error('Falha ao obter a shipping rate:', err)
    return null
  }
}

function mapShippingAddress(session: Stripe.Checkout.Session) {
  const details = session.shipping_details
  const address = details?.address
  if (!address) return null
  return {
    name: details?.name ?? session.customer_details?.name ?? null,
    line1: address.line1 ?? null,
    line2: address.line2 ?? null,
    postal_code: address.postal_code ?? null,
    city: address.city ?? null,
    state: address.state ?? null,
    country: address.country ?? null,
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET não configurado')
    return jsonResponse({ error: 'Webhook não configurado' }, 500)
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return jsonResponse({ error: 'Cabeçalho stripe-signature em falta' }, 400)
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret, undefined, cryptoProvider)
  } catch (err) {
    console.warn('Assinatura do webhook inválida:', err instanceof Error ? err.message : err)
    return jsonResponse({ error: 'Assinatura inválida' }, 400)
  }

  // Sessão expirada sem pagamento: a encomenda pendente passa a cancelada.
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId
    if (orderId) {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelado' })
        .eq('id', orderId)
        .eq('status', 'pendente')
      if (error) console.error('Falha ao cancelar encomenda expirada:', error.message)
    }
    return jsonResponse({ received: true }, 200)
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (!orderId) {
      console.warn('checkout.session.completed sem orderId:', session.id)
      return jsonResponse({ received: true }, 200)
    }

    // Só cartão neste checkout; não marcar como pago se o pagamento não estiver concluído
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      console.warn(`Sessão ${session.id} concluída sem pagamento (${session.payment_status})`)
      return jsonResponse({ received: true }, 200)
    }

    const update: Record<string, unknown> = {
      status: 'pago',
      stripe_session_id: session.id,
      shipping_amount: (session.shipping_cost?.amount_total ?? 0) / 100,
      shipping_method: await resolveShippingMethod(session),
      customer_phone: session.customer_details?.phone ?? null,
      customer_name: session.customer_details?.name ?? null,
      shipping_address: mapShippingAddress(session),
    }
    // Os portes foram calculados pelo código postal declarado antes de pagar.
    // Se a morada final for de outra zona, a encomenda fica marcada para verificar.
    const declaredZone = session.metadata?.declaredZone
    const finalZone = zoneOf(session.shipping_details?.address?.postal_code)
    if (declaredZone && finalZone !== declaredZone) {
      update.shipping_method = 'ctt-verificar'
      console.warn(`Encomenda ${orderId}: CP declarado ${session.metadata?.declaredPostal} (${declaredZone}) difere da morada (${finalZone})`)
    }

    if (typeof session.amount_total === 'number') {
      update.total_amount = session.amount_total / 100
    }

    // Idempotente: só atualiza encomendas ainda 'pendente' (um evento repetido
    // não reescreve uma encomenda que o admin já passou para 'enviado').
    const { data: updated, error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', orderId)
      .eq('status', 'pendente')
      .select('id')

    if (error) {
      console.error('Falha ao atualizar a encomenda:', error.message)
      return jsonResponse({ error: 'Falha ao atualizar a encomenda' }, 500)
    }

    if (!updated || updated.length === 0) {
      console.warn(`Encomenda ${orderId} não estava 'pendente' (evento repetido ou inexistente)`)
    }
  }

  return jsonResponse({ received: true }, 200)
})
