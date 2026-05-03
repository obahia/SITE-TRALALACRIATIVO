import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase'; // Importe o cliente
import { Search, Package } from 'lucide-react';

const Produtos = () => {
  // 1. Estados para guardar dados e controlar carregamento
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Categorias disponíveis
  const categories = ['Todos', 'Canecas', 'Camisetas', 'Azulejos', 'Acessórios'];

  // 3. Buscar produtos no Supabase ao carregar a página
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products') // Nome da sua tabela
          .select('*')
          .order('created_at', { ascending: false }); // Opcional: Mostra os mais novos primeiro

        if (error) throw error;

        if (data) {
          setProducts(data);
        }
       } catch (error) {
         // Error already handled by state
       } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 4. Filtrar produtos por categoria e busca
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-10 px-8 md:px-16 lg:px-32"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-slate-700 mb-2">Nossos Produtos</h1>
        <p className="text-center text-gray-500 mb-12">Escolha seu produto favorito e personalize do seu jeito!</p>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                selectedCategory === category
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-brand-blue/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Count */}
        {!loading && (
          <div className="text-center mb-6 text-gray-500 text-sm">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 text-gray-400">
            <p>Carregando catálogo...</p>
          </div>
        )}

        {/* Empty State (quando filtros não retornam resultados) */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Nenhum produto encontrado</p>
            <p className="text-sm mt-2">Tente ajustar sua busca ou filtros</p>
          </div>
        )}

        {/* Grid de Produtos com Stagger Animation */}
        {!loading && filteredProducts.length > 0 && (
          <motion.div 
            key={selectedCategory + searchQuery}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {filteredProducts.map((produto) => (
              <motion.div
                key={produto.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard 
                  id={produto.id}
                  // Mapeando as colunas do banco para as props do Card:
                  title={produto.name}           // No banco é 'name', no Card é 'title'
                  description={produto.description}
                  price={produto.price}
                  image={produto.image_url}      // Importante: passando a URL da imagem
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Produtos;