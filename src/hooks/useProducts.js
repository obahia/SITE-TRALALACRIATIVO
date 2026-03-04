import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useProducts = (options = {}) => {
  const { limit = null, orderBy = 'created_at', ascending = false } = options;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('products')
          .select('*')
          .order(orderBy, { ascending });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setProducts(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar produtos:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit, orderBy, ascending]);

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
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        setProduct(data);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar produto:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};
