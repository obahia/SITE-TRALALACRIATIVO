import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';

const Cancelado = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center border border-gray-100">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={48} />
                </div>

                <h1 className="text-3xl font-black text-gray-800 mb-4">Pagamento Cancelado</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Parece que houve um problema com o pagamento ou decidiste cancelar. Não te preocupes, os teus itens continuam no carrinho!
                </p>

                <div className="space-y-4">
                    <Link
                        to="/produtos"
                        className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-all"
                    >
                        Tentar Novamente <ShoppingCart size={20} />
                    </Link>

                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 w-full text-gray-400 font-bold py-4 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={18} /> Voltar ao Início
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cancelado;
