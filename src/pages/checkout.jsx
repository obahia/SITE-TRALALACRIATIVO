import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { logger } from '../utils/logger';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/produtos');
      return;
    }

    createCheckoutSession();
  }, [user, cartItems, navigate]);

  const createCheckoutSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Não autenticado');
      }

      const checkoutItems = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        customization: item.customization || null,
      }));

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-brand-blue" />
          <h1 className="text-3xl font-bold text-gray-800">A preparar checkout...</h1>
          <p className="text-gray-500 mt-2">Carregando segurança do pagamento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Erro no Checkout</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/produtos')}
            className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Erro ao carregar checkout</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/produtos')}
            className="flex items-center gap-2 text-brand-blue hover:text-brand-blue/80 transition font-semibold mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
            Voltar
          </button>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">Checkout Seguro</h1>
            <p className="text-gray-600 text-lg">Completa o teu pagamento com a máxima segurança</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Formulário de Pagamento */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>

          {/* Resumo do Carrinho - Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Resumo do Pedido</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</p>
                        {item.customization && Object.keys(item.customization).length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Com personalização
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-brand-blue ml-2">x{item.quantity}</span>
                    </div>
                    <p className="text-right font-bold text-gray-900">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600 font-medium">Total:</span>
                  <span className="text-3xl font-black text-brand-blue">
                    €{cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>

                {/* Trust Badges */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-xl">
                    <Lock size={16} className="text-brand-blue flex-shrink-0" />
                    <span className="font-medium">Pagamento 100% Seguro</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-green-50 p-3 rounded-xl">
                    <span className="text-lg">✓</span>
                    <span className="font-medium">Powered by Stripe</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-purple-50 p-3 rounded-xl">
                    <span className="text-lg">🛡️</span>
                    <span className="font-medium">Dados Encriptados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
