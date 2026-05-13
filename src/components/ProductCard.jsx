import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { formatPriceSimple } from '../utils/formatters';

const ProductCard = ({ id, title, description, price, image, stockQuantity }) => {
  const esgotado = stockQuantity === 0;

  return (
    <motion.div
      whileHover={{ y: esgotado ? 0 : -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative rounded-2xl bg-white p-1 h-full flex flex-col"
    >
      {/* Borda Gradiente */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-[2px]"></div>

      <div className="relative h-full bg-white rounded-xl p-6 flex flex-col items-center text-center shadow-sm group-hover:shadow-card-hover transition-shadow duration-300">

        {/* Imagem */}
        <div className="w-full aspect-square bg-gradient-to-tr from-blue-50 to-pink-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500 overflow-hidden relative shrink-0 z-0">
          {image ? (
            <img
              src={image}
              alt={title}
              className={`w-full h-full object-cover object-center ${esgotado ? 'opacity-50 grayscale' : ''}`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <>
              <div className="absolute bg-brand-blue/10 w-32 h-32 rounded-full blur-2xl -top-10 -left-10 -z-10"></div>
              <Package size={64} className="text-brand-blue/50 relative z-10" strokeWidth={1.5} />
            </>
          )}

          {/* Badge Esgotado */}
          {esgotado && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold text-sm px-4 py-1.5 rounded-full shadow-lg rotate-[-8deg] tracking-wide uppercase">
                Esgotado
              </span>
            </div>
          )}
        </div>

        {/* --- 2. TÍTULO PADRONIZADO (1 linha) --- */}
        <h3
          className="font-bold text-xl text-brand-dark mb-2 line-clamp-1 w-full"
          title={title}
        >
          {title}
        </h3>

        {/* --- 3. DESCRIÇÃO PADRONIZADA (Altura fixa para 2 linhas) --- */}
        <p className="text-sm text-gray-500 mb-6 leading-relaxed line-clamp-2 h-10 overflow-hidden w-full">
          {description}
        </p>

        {/* --- 4. RODAPÉ (Preço e Botão) --- */}
        <div className="mt-auto w-full">
          <div className="text-2xl font-bold text-brand-blue mb-4">
            {formatPriceSimple(price)}
          </div>

          {esgotado ? (
            <div className="block w-full py-3 px-6 bg-gray-200 text-gray-400 font-bold rounded-xl text-center cursor-not-allowed">
              Produto Esgotado
            </div>
          ) : (
            <Link
              to={`/produto/${id}`}
              className="block w-full py-3 px-6 bg-gradient-to-r from-brand-pink to-brand-blue text-white font-bold rounded-xl shadow-md hover:shadow-glow-blue hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              Personalizar Agora
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;