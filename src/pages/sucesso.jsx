import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Sucesso = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { clearCart } = useCart();

    useEffect(() => {
        // Se o pagamento foi um sucesso, limpamos o carrinho local/supabase do usuário
        clearCart();
    }, [clearCart]);

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
};

export default Sucesso;
