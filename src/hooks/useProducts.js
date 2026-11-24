import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

// Fotografia real: não vazia e não um marcador de posição (placehold.co).
export const hasPhoto = (p) => Boolean(p?.image_url) && !/placehold\.co/i.test(p.image_url);

export const useProducts = (options = {}) => {
  const {
    limit = null,
    orderBy = 'created_at',
    ascending = false,
    occasion = null, // slug de src/data/occasions.js
    featuredOnly = false,
    onlyWithPhoto = false, // loja pública: esconde artigos ainda sem fotografia
  } = options;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order(orderBy, { ascending });

        if (occasion) {
          query = query.contains('occasions', [occasion]);
        }

        if (featuredOnly) {
          query = query.eq('is_featured', true);
        }

        if (limit) {
          query = query.limit(limit);
        }

        let { data, error: fetchError } = await query;

        // 42703 = coluna inexistente: a migração 020 ainda não foi aplicada.
        // Mostra o catálogo antigo em vez de uma página vazia.
        if (fetchError?.code === '42703') {
          const fallback = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          fetchError = fallback.error;
          // Sem as colunas novas não há destaques nem ocasiões: listas vazias escondem essas secções.
          data = featuredOnly || occasion ? [] : (fallback.data || []);
          if (limit) data = data.slice(0, limit);
        }

        if (fetchError) throw fetchError;

        const list = data || [];
        if (!cancelled) setProducts(onlyWithPhoto ? list.filter(hasPhoto) : list);
       } catch (err) {
         if (!cancelled) setError(err.message);
       } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, [limit, orderBy, ascending, occasion, featuredOnly, onlyWithPhoto]);

  return { products, loading, error };
};

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
         const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        setProduct(data);
       } catch (err) {
         setError(err.message);
       } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};
