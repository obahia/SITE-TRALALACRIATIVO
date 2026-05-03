// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// Chave do localStorage
const CART_STORAGE_KEY = 'shopping-cart';

// Função auxiliar para salvar no localStorage
const saveToLocalStorage = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 1. BUSCAR CARRINHO - Ao iniciar ou quando usuário muda
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Buscar carrinho do Supabase
        const { data } = await supabase
          .from('cart_items')
          .select('*, product:products(*)')
          .eq('user_id', user.id);

        if (data) {
          const formattedItems = data.map(item => ({
            cartId: item.id,
            id: item.product.id,
            name: item.product.name,
            price: item.price || item.product.price, // Usa o preço salvo no carrinho
            image: item.product.image_url || item.product.image || '',
            quantity: item.quantity,
            customization: item.customization
          }));
          setCartItems(formattedItems);
        }

        // Migrar carrinho local para Supabase (se existir)
        const localCart = localStorage.getItem(CART_STORAGE_KEY);
        if (localCart) {
          const localItems = JSON.parse(localCart);
          if (localItems.length > 0) {
            // Verificar itens existentes no Supabase para evitar duplicatas
            const { data: existingItems } = await supabase
              .from('cart_items')
              .select('product_id, customization')
              .eq('user_id', user.id);

            const existingKeys = new Set(
              existingItems?.map(item => `${item.product_id}-${JSON.stringify(item.customization || {})}`) || []
            );

            // Filtrar apenas itens que não existem
            const newItems = localItems.filter(item => {
              const key = `${item.id}-${JSON.stringify(item.customization || {})}`;
              return !existingKeys.has(key);
            });

            // Bulk insert apenas dos novos itens
            if (newItems.length > 0) {
              const itemsToInsert = newItems.map(item => ({
                user_id: user.id,
                product_id: item.id,
                quantity: item.quantity,
                customization: item.customization,
                price: item.price
              }));

              await supabase.from('cart_items').insert(itemsToInsert);
            }

            // Limpar localStorage após migração
            localStorage.removeItem(CART_STORAGE_KEY);

            // Recarregar carrinho do Supabase
            const { data: updatedData } = await supabase
              .from('cart_items')
              .select('*, product:products(*)')
              .eq('user_id', user.id);
            if (updatedData) {
              const formattedUpdated = updatedData.map(item => ({
                cartId: item.id,
                id: item.product.id,
                name: item.product.name,
                price: item.price || item.product.price,
                image: item.product.image_url || item.product.image || '',
                quantity: item.quantity,
                customization: item.customization
              }));
              setCartItems(formattedUpdated);
            }
          }
        }
      } else {
        // Carregar do localStorage quando não logado
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
           try {
             setCartItems(JSON.parse(savedCart));
           } catch {
             // Parse error - fallback to empty cart
             setCartItems([]);
           }
        } else {
          setCartItems([]);
        }
      }
    };

    loadCart();
  }, [user]);

  // 2. ADICIONAR AO CARRINHO
  const addToCart = useCallback(async (product, quantity, customization) => {
    setIsCartOpen(true);

    // Usar functional update para evitar race condition
    setCartItems(prev => {
      // Verificar se já existe item igual
      const existingItemIndex = prev.findIndex(item =>
        item.id === product.id &&
        JSON.stringify(item.customization || {}) === JSON.stringify(customization || {})
      );

      if (existingItemIndex !== -1) {
        // Item já existe - atualizar quantidade
        const existingItem = prev[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        const updated = prev.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: newQuantity } : item
        );

        if (!user) saveToLocalStorage(updated);

        // Atualizar no Supabase de forma assíncrona (sem bloquear)
        if (user) {
          supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', existingItem.cartId).then();
        }

        return updated;
      }

      // Item novo - adicionar
      const tempId = Date.now();
      const newItem = {
        ...product,
        cartId: tempId,
        quantity,
        customization,
        image: product.image_url || product.image || ''
      };

      const updated = [...prev, newItem];

      if (!user) saveToLocalStorage(updated);

      // Inserir no Supabase de forma assíncrona (sem bloquear)
      if (user) {
        supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity,
          customization: customization,
          price: product.price
        }).select().single().then(({ data }) => {
          if (data) {
            setCartItems(current => current.map(item =>
              item.cartId === tempId ? { ...item, cartId: data.id } : item
            ));
          }
        });
      }

      return updated;
    });
  }, [user]);

  // 3. REMOVER DO CARRINHO
  const removeFromCart = useCallback((cartId) => {
    setCartItems(prev => {
      const filtered = prev.filter(item => item.cartId !== cartId);
      if (!user) saveToLocalStorage(filtered);
      return filtered;
    });

    if (user) {
      supabase.from('cart_items').delete().eq('id', cartId).then();
    }
  }, [user]);

  // 4. ATUALIZAR QUANTIDADE
  const updateQuantity = useCallback((cartId, amount) => {
    setCartItems(prev => {
      const item = prev.find(i => i.cartId === cartId);
      if (!item) return prev;

      const newQuantity = item.quantity + amount;
      if (newQuantity < 1) return prev;

      const updated = prev.map(i =>
        i.cartId === cartId ? { ...i, quantity: newQuantity } : i
      );
      if (!user) saveToLocalStorage(updated);

      if (user) {
        supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', cartId).then();
      }

      return updated;
    });
  }, [user]);

  // 5. LIMPAR CARRINHO
  const clearCart = useCallback(async () => {
    setCartItems([]);
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [user]);

  // 5.5 CÁLCULOS DO CARRINHO
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // 6. INICIAR CHECKOUT COM STRIPE
  const { setIsLoginModalOpen } = useAuth();

  const startStripeCheckout = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (cartItems.length === 0) return;

    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      // Enviar apenas product_id, quantity e customization — precos sao calculados no servidor
      const checkoutItems = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        customization: item.customization || null,
      }));

      // Edge function cria o pedido + itens + sessao Stripe (tudo server-side)
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          cartItems: checkoutItems,
          successUrl: `${window.location.origin}/sucesso`,
          cancelUrl: `${window.location.origin}/cancelado`,
        }
      });

      if (functionError) throw functionError;

      // Redirecionar para o Stripe
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Nao foi possivel gerar a sessao de pagamento.');
      }

     } catch (err) {
       setCheckoutError('Erro ao processar pagamento. Por favor, tente novamente.');
     } finally {
      setCheckoutLoading(false);
    }
  };

  const clearCheckoutError = useCallback(() => setCheckoutError(''), []);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      startStripeCheckout,
      checkoutLoading,
      checkoutError,
      clearCheckoutError,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);