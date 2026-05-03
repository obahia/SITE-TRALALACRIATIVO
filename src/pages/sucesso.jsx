import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const Sucesso = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const { clearCart } = useCart();
    const { user } = useAuth();
    
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pollingTimeout, setPollingTimeout] = useState(false);

    useEffect(() => {
        if (!orderId || !user) {
            if (!orderId) {
                navigate('/');
            }
            return;
        }

        let pollingInterval = null;
        let timeoutId = null;

        const checkOrderStatus = async () => {
            try {
                const { data: order, error } = await supabase
                    .from('orders')
                    .select('status, user_id')
                    .eq('id', orderId)
                    .single();

                if (error || !order) {
                    // Order not found or error - redirect to home
                    navigate('/');
                    return;
                }

                // Verify order belongs to current user
                if (order.user_id !== user.id) {
                    navigate('/');
                    return;
                }

                setOrderStatus(order.status);

                // If payment confirmed, clear cart and stop polling
                if (order.status === 'pago') {
                    if (pollingInterval) clearInterval(pollingInterval);
                    if (timeoutId) clearTimeout(timeoutId);
                    await clearCart();
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error checking order status:', err);
                navigate('/');
            }
        };

        // Initial check
        checkOrderStatus();

        // Set up polling for pending orders (3s interval, max 30s)
        timeoutId = setTimeout(() => {
            if (pollingInterval) clearInterval(pollingInterval);
            setPollingTimeout(true);
            setLoading(false);
        }, 30000);

        pollingInterval = setInterval(() => {
            checkOrderStatus();
        }, 3000);

        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [orderId, user, navigate, clearCart]);

    // Show loading state while checking payment
    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
                        <Loader size={48} />
                    </div>

                    <h1 className="text-3xl font-black text-gray-800 mb-4">A Verificar Pagamento</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Estamos a confirmar o seu pagamento. Por favor, aguarde...
                    </p>
                </div>
            </div>
        );
    }

    // Show timeout message if polling exceeded 30s
    if (pollingTimeout) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={48} />
                    </div>

                    <h1 className="text-3xl font-black text-gray-800 mb-4">A Verificar Pagamento</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        O seu pedido <span className="font-bold text-brand-blue">#{orderId?.slice(0, 8)}</span> está a ser processado. Receberá uma confirmação por email em breve.
                    </p>

                    <div className="space-y-4">
                        <Link
                            to="/produtos"
                            className="flex items-center justify-center gap-2 w-full bg-brand-blue text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-glow-blue transition-all"
                        >
                            Continuar a Comprar <ShoppingBag size={20} />
                        </Link>

                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 w-full text-gray-500 font-bold py-4 hover:text-gray-800 transition-colors"
                        >
                            Voltar ao Início <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Show success message when payment confirmed
    if (orderStatus === 'pago') {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} />
                    </div>

                    <h1 className="text-3xl font-black text-gray-800 mb-4">Pagamento Confirmado!</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Obrigado pela sua compra! O seu pedido <span className="font-bold text-brand-blue">#{orderId?.slice(0, 8)}</span> já está a ser processado com todo o carinho.
                    </p>

                    <div className="space-y-4">
                        <Link
                            to="/produtos"
                            className="flex items-center justify-center gap-2 w-full bg-brand-blue text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-glow-blue transition-all"
                        >
                            Continuar a Comprar <ShoppingBag size={20} />
                        </Link>

                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 w-full text-gray-500 font-bold py-4 hover:text-gray-800 transition-colors"
                        >
                            Voltar ao Início <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback (should not reach here)
    return null;
};

export default Sucesso;
