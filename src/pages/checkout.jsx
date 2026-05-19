import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { logger } from '../utils/logger';
import { Loader2, ArrowLeft } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redireciona se não autenticado ou carrinho vazio
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/produtos');
      return;
    }

    // Criar sessão de checkout
    createCheckoutSession();
  }, [user, cartItems, navigate]);

  const createCheckoutSession = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obter token de autenticação
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Não autenticado');
      }

      const checkoutItems = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        customization: item.customization || null,
      }));

      // Chamar Edge Function com autenticação
      const { data, error: functionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: {
            cartItems: checkoutItems,
            successUrl: `${window.location.origin}/sucesso`,
            cancelUrl: `${window.location.origin}/produtos`,
          },
        }
      );

      if (functionError) {
        logger.error('Checkout session creation failed', {
          error: functionError.message,
        });
        throw new Error('Erro ao criar sessão de pagamento');
      }

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error('Nenhum client secret retornado');
      }
    } catch (err) {
      logger.error('Checkout error', { error: err.message });
      setError(err.message || 'Erro ao processar checkout');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-brand-blue" />
          <h1 className="text-2xl font-bold text-gray-800">A preparar checkout...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Erro no Checkout</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/produtos')}
            className="w-full bg-brand-blue text-white font-bold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Voltar aos Produtos
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar checkout</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/produtos')}
            className="flex items-center gap-2 text-brand-blue hover:text-brand-blue/80 transition font-semibold mb-6"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <h1 className="text-4xl font-black text-gray-800 mb-2">Checkout Seguro</h1>
          <p className="text-gray-600">Completa o teu pagamento com segurança</p>
        </div>

        {/* Resumo do Carrinho */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Resumo do Pedido</h2>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={`${item.id}-${JSON.stringify(item.customization)}`} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  {item.customization && Object.keys(item.customization).length > 0 && (
                    <p className="text-sm text-gray-500">
                      {Object.entries(item.customization)
                        .map(([key, val]) => `${key}: ${val}`)
                        .join(' | ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    €{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Total:</span>
              <span className="text-3xl font-black text-brand-blue">
                €{cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Stripe Payment Element */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex justify-center items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <span>Pagamento 100% Seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span>Powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
