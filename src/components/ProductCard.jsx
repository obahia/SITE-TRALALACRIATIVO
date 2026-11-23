import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { formatPriceSimple } from '../utils/formatters';

// Recebe a linha da tabela products tal como vem do Supabase.
const ProductCard = ({ product }) => {
  const {
    id,
    name,
    description,
    price,
    image_url: image,
    stock_quantity: stockQuantity,
    min_quantity: minQuantity = 1,
    sale_mode: saleMode = 'cart',
    price_note: priceNote,
  } = product;

  const esgotado = stockQuantity === 0;
  const isQuote = saleMode === 'quote';
  const unitPrice = Number(price);
  const perUnit = minQuantity > 1;
  const perLetter = priceNote === 'Preço por letra';

  return (
    <Link
      to={`/produto/${id}`}
      aria-disabled={esgotado || undefined}
      className={`group flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-gray-100
        shadow-[0_2px_6px_-2px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_36px_-18px_rgba(15,23,42,0.35)]
        hover:-translate-y-1 transition-[transform,box-shadow] duration-300 ease-out
        ${esgotado ? 'pointer-events-none opacity-70' : ''}`}
    >
      <div className="relative aspect-[4/5] bg-brand-light overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${esgotado ? 'grayscale' : ''}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={56} className="text-brand-blue/40" strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
        {esgotado && (
          <span className="absolute top-3 left-3 bg-gray-900 text-white font-bold text-xs px-3 py-1.5 rounded-full">
            Esgotado
          </span>
        )}
        {!esgotado && perUnit && (
          <span className="absolute top-3 left-3 bg-white/95 text-gray-800 font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
            Mín. {minQuantity} un.
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-lg leading-snug text-gray-900 group-hover:text-brand-blue transition-colors">{name}</h3>
        {description && (
          <p className="hidden sm:block text-sm text-gray-600 mt-1.5 leading-relaxed line-clamp-2">{description}</p>
        )}
        <div className="mt-auto pt-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          {isQuote ? (
            <span className="font-bold text-brand-pink">{priceNote || 'Sob orçamento'}</span>
          ) : (
            <span className="text-xl font-bold text-gray-900 tabular-nums">
              {priceNote?.toLowerCase().startsWith('desde') ? 'Desde ' : ''}
              {formatPriceSimple(unitPrice)}
              {(perUnit || perLetter) && (
                <span className="text-sm font-semibold text-gray-500">{perLetter ? ' /letra' : ' /un.'}</span>
              )}
            </span>
          )}
          <span className="text-sm font-bold text-brand-blue shrink-0">
            {isQuote ? 'Pedir orçamento' : 'Personalizar'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
