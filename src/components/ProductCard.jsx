import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { formatPriceSimple } from '../utils/formatters';

// Recebe a linha da tabela products tal como vem do Supabase.
const TILES = ['bg-tile-sky', 'bg-tile-rose', 'bg-tile-sun'];

const ProductCard = ({ product, tone = 0 }) => {
  const {
    id,
    name,
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

  const tile = TILES[tone % TILES.length];

  return (
    <Link
      to={`/produto/${id}`}
      aria-disabled={esgotado || undefined}
      className={`group flex flex-col h-full ${esgotado ? 'pointer-events-none opacity-70' : ''}`}
    >
      <div className={`relative aspect-[4/5] ${tile} rounded-2xl overflow-hidden`}>
        {image ? (
          <img
            src={image}
            alt={name}
            className={`absolute inset-[8%] w-[84%] h-[84%] object-cover rounded-xl transition-transform duration-500 ease-[var(--ease-soft)] group-hover:scale-[1.04] ${esgotado ? 'grayscale' : ''}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={56} className="text-ink-soft/50" strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
        {esgotado && (
          <span className="absolute top-3 left-3 bg-ink text-paper font-bold text-sm px-3 py-1.5 rounded-full">Esgotado</span>
        )}
      </div>

      <div className="flex flex-col flex-1 pt-4">
        <h3 className="font-bold text-lg leading-snug text-ink group-hover:text-pink-ink transition-colors duration-200">{name}</h3>
        <p className={`mt-1 text-base font-semibold tabular-nums ${isQuote ? 'text-pink-ink' : 'text-ink'}`}>
          {isQuote ? priceNote || 'Sob orçamento' : (
            <>
              {priceNote?.toLowerCase().startsWith('desde') ? 'Desde ' : ''}
              {formatPriceSimple(unitPrice)}
              {(perUnit || perLetter) && <span className="text-ink-soft font-normal">{perLetter ? ' por letra' : ' por unidade'}</span>}
            </>
          )}
        </p>
        {perUnit && <p className="text-base text-ink-soft">Mínimo {minQuantity}</p>}
      </div>
    </Link>
  );
};

export default ProductCard;
