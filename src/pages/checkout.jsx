import React, { useEffect, useId, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Lock, Truck, MapPin } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { logger } from '../utils/logger';
import { formatPriceSimple } from '../utils/formatters';
import { zoneForPostal, shippingFor } from '../utils/shipping';
import { SHIPPING, CONTACT } from '../data/occasions';
import { CONTAINER_CLASS } from '../constants';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// A edge function devolve { error } com o motivo; o supabase-js só dá uma mensagem genérica.
const readFunctionError = async (functionError) => {
  try {
    const body = await functionError?.context?.json?.();
    if (body?.error) return body.error;
  } catch {
    // corpo não era JSON
  }
  return 'Não foi possível iniciar o pagamento. Tente de novo.';
};

const Checkout = () => {
  const uid = useId();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems } = useCart();

  const [delivery, setDelivery] = useState('ctt'); // 'ctt' | 'levantamento'
  const [postalCode, setPostalCode] = useState('');
  const [postalError, setPostalError] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) navigate('/');
    else if (cartItems.length === 0) navigate('/produtos');
  }, [user, cartItems.length, navigate]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const postal = zoneForPostal(postalCode);
  const shipping = delivery === 'levantamento' ? 0 : postal.ok ? shippingFor(postal.zone, subtotal) : null;
  const total = shipping === null ? null : subtotal + shipping;
  const missingForFree = SHIPPING.freeFrom - subtotal;

  const startPayment = async (e) => {
    e.preventDefault();
    setError(null);
    if (delivery === 'ctt' && !postal.ok) {
      setPostalError(postal.error);
      document.getElementById(`${uid}-postal`)?.focus();
      return;
    }

    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('A sua sessão terminou. Entre de novo na conta.');

      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          cartItems: cartItems.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            customization: item.customization || null,
          })),
          successUrl: `${window.location.origin}/sucesso`,
          delivery,
          postalCode: delivery === 'ctt' ? postal.postal : null,
        },
      });

      if (functionError) {
        const message = await readFunctionError(functionError);
        logger.error('Checkout session creation failed', { error: message });
        throw new Error(message);
      }
      if (!data?.clientSecret) throw new Error('Não foi possível iniciar o pagamento. Tente de novo.');
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const changeDelivery = () => {
    setClientSecret(null);
    setError(null);
  };

  return (
    <div className={`${CONTAINER_CLASS} py-10 md:py-14`}>
      <Link to="/produtos" className="inline-flex items-center gap-2 text-ink-soft hover:text-pink-ink font-semibold mb-6">
        <ArrowLeft size={18} /> Continuar a comprar
      </Link>
      <h1 className="text-[clamp(2.25rem,4.2vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em] text-ink">
        {clientSecret ? 'Pagamento' : 'Envio'}
      </h1>

      <div className="mt-10 grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 min-w-0">
          {!clientSecret ? (
            <form onSubmit={startPayment} noValidate className="space-y-8">
              <fieldset>
                <legend className="text-xl font-bold text-ink mb-4">Como quer receber?</legend>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { value: 'ctt', icon: Truck, title: 'Envio por CTT', text: `${formatPriceSimple(SHIPPING.leiriaPrice)} no distrito de Leiria, ${formatPriceSimple(SHIPPING.cttPrice)} no resto do continente` },
                    { value: 'levantamento', icon: MapPin, title: 'Levantar em Leiria', text: `Grátis, em ${CONTACT.address}` },
                  ].map((opt) => {
                    const active = delivery === opt.value;
                    const Icon = opt.icon;
                    return (
                      <label
                        key={opt.value}
                        className={`flex gap-3 p-5 rounded-2xl cursor-pointer transition-colors duration-200 focus-within:ring-4 focus-within:ring-brand-blue/30 ${
                          active ? 'bg-tile-sky' : 'bg-paper hover:bg-tile-sky/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`${uid}-delivery`}
                          value={opt.value}
                          checked={active}
                          onChange={() => { setDelivery(opt.value); setPostalError(''); }}
                          className="sr-only"
                        />
                        <Icon size={22} className="text-ink shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          <span className="block font-bold text-lg text-ink">{opt.title}</span>
                          <span className="block text-base text-ink-soft">{opt.text}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {delivery === 'ctt' && (
                <div className="max-w-sm">
                  <label htmlFor={`${uid}-postal`} className="block text-base font-bold text-ink mb-1.5">
                    Código postal de entrega
                  </label>
                  <input
                    id={`${uid}-postal`}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="2400-123"
                    maxLength={8}
                    value={postalCode}
                    onChange={(e) => { setPostalCode(e.target.value); setPostalError(''); }}
                    onBlur={() => { if (postalCode && !postal.ok) setPostalError(postal.error); }}
                    aria-invalid={!!postalError}
                    aria-describedby={`${uid}-postal-note`}
                    className="w-full h-12 px-4 rounded-xl bg-paper text-ink text-lg placeholder-ink-soft/60 focus:outline-none focus:ring-4 focus:ring-brand-blue/30 tabular-nums"
                  />
                  <p id={`${uid}-postal-note`} className={`mt-1.5 text-base ${postalError ? 'text-red-700 font-semibold' : 'text-ink-soft'}`} aria-live="polite">
                    {postalError ||
                      (postal.ok
                        ? postal.zone === 'leiria' ? 'Distrito de Leiria.' : 'Portugal continental.'
                        : 'Usamos o código postal para calcular os portes. A morada completa pede-se no passo seguinte.')}
                  </p>
                </div>
              )}

              {error && (
                <p className="p-4 rounded-xl bg-red-50 text-red-700 font-semibold" aria-live="polite">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full bg-ink text-paper text-lg font-bold hover:bg-pink-ink active:scale-[0.98] transition disabled:opacity-70 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : <><Lock size={18} /> Continuar para o pagamento</>}
              </button>
            </form>
          ) : (
            <div>
              <button
                type="button"
                onClick={changeDelivery}
                className="mb-4 inline-flex items-center gap-1.5 font-semibold text-ink underline underline-offset-4 decoration-2 decoration-brand-pink hover:text-pink-ink cursor-pointer"
              >
                Alterar envio
              </button>
              <div className="bg-white rounded-2xl p-4 md:p-6">
                <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            </div>
          )}
        </div>

        {/* Resumo */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28 bg-paper rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-ink">Resumo</h2>
          <ul className="mt-5 space-y-4 max-h-72 overflow-y-auto">
            {cartItems.map((item) => (
              <li key={item.cartId} className="flex gap-4">
                {item.image ? (
                  <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 bg-tile-sky" />
                ) : (
                  <span className="w-14 h-14 rounded-xl bg-tile-sky shrink-0" aria-hidden="true" />
                )}
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-ink truncate">{item.name}</span>
                  <span className="block text-base text-ink-soft tabular-nums">{item.quantity} × {formatPriceSimple(Number(item.price))}</span>
                </span>
                <span className="font-semibold text-ink tabular-nums">{formatPriceSimple(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 text-base text-ink">
            <div className="flex justify-between">
              <dt>Produtos</dt>
              <dd className="tabular-nums">{formatPriceSimple(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Portes</dt>
              <dd className="tabular-nums">
                {shipping === null ? 'indique o código postal' : shipping === 0 ? 'grátis' : formatPriceSimple(shipping)}
              </dd>
            </div>
            <div className="flex justify-between items-baseline pt-3">
              <dt className="text-lg font-bold">Total</dt>
              <dd className="text-3xl font-bold tabular-nums">{formatPriceSimple(total ?? subtotal)}</dd>
            </div>
          </dl>

          {delivery === 'ctt' && missingForFree > 0 && (
            <p className="mt-4 text-base text-ink-soft">
              Faltam {formatPriceSimple(missingForFree)} para portes grátis.
            </p>
          )}
          <p className="mt-4 flex items-center gap-2 text-base text-ink-soft">
            <Lock size={16} aria-hidden="true" /> Pagamento por cartão através da Stripe.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
