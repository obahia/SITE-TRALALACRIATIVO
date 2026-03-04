import React from 'react';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';

const Produtos = () => {
  const { products, loading } = useProducts();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-10 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-slate-700 mb-2">Nossos Produtos</h1>
        <p className="text-center text-gray-500 mb-12">Escolha seu produto favorito e personalize do seu jeito!</p>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 text-gray-400">
            <p>Carregando catálogo...</p>
          </div>
        )}

        {/* Empty State (se não houver produtos) */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p>Nenhum produto encontrado.</p>
          </div>
        )}

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((produto) => (
            <ProductCard 
              key={produto.id}
              id={produto.id}
              // Mapeando as colunas do banco para as props do Card:
              title={produto.name}           // No banco é 'name', no Card é 'title'
              description={produto.description}
              price={produto.price}
              image={produto.image_url}      // Importante: passando a URL da imagem
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Produtos;