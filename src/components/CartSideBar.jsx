import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight, FileText, Image as ImageIcon, Plus, Minus, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPriceSimple } from '../utils/formatters';

const CartSidebar = () => {
  // Pegamos a nova função updateQuantity do contexto
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    startStripeCheckout,
    checkoutLoading
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay escuro para fechar ao clicar fora */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sidebar do carrinho */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'tween',
              duration: 0.4,
              ease: [0.32, 0.72, 0, 1]
            }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Cabeçalho */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <ShoppingBag className="text-brand-blue" /> Carrinho
              </h2>
              <button type="button" onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"><X size={24} /></button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                  <ShoppingBag size={64} className="mb-4 opacity-20" />
                  <p>Seu carrinho está vazio.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.cartId} className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    {/* Imagem */}
                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.cartId)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                        </div>

                        {/* Personalização */}
                        {(item.customization?.uploadedImage || item.customization?.instructions || item.customization?.personalizationType) && (
                          <div className="mt-2 space-y-1">
                            {item.customization.personalizationType && (
                              <div className="text-[10px] font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded w-fit capitalize">
                                {item.customization.personalizationType}
                              </div>
                            )}
                            {item.customization.uploadedImage && (
                              <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded w-fit">
                                <ImageIcon size={10} /> <span>Imagem Anexada</span>
                              </div>
                            )}
                            {item.customization.instructions && (
                              <div className="flex items-start gap-1.5 text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                <FileText size={10} className="mt-0.5 shrink-0" />
                                <span className="line-clamp-2 italic">"{item.customization.instructions}"</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* RODAPÉ DO ITEM: PREÇO E CONTROLE DE QUANTIDADE */}
                      <div className="flex justify-between items-end mt-3">

                        {/* Controle de Quantidade */}
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-brand-pink active:scale-95 transition"
                            disabled={item.quantity <= 1} // Desabilita se for 1
                          >
                            <Minus size={12} />
                          </button>

                          <span className="text-xs font-bold text-gray-800 w-4 text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-brand-blue active:scale-95 transition"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="font-bold text-brand-blue">
                          {formatPriceSimple(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rodapé Total */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-3xl font-black text-gray-900">{formatPriceSimple(cartTotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={startStripeCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>Finalizar Compra <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;